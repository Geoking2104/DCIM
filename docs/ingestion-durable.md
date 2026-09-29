# Ingestion durable et rejeu (P1)

Chaîne cible : **collecteurs → spool durable → rejeu idempotent → ClickHouse**.
Implémentée dans `crates/qinode-ingest` (`spool`, `clickhouse_sink`) avec tests
automatisés et simulateur de bout en bout (sans matériel requis).

```
Redfish (Rust, lecture seule) ┐
SNMP (Telegraf)               ├→ spool JSONL append-only → replay_spool → ClickHouse
BACnet/Modbus (Telegraf)      ┘        (par source)          (qinode-ingest)   power_metrics
                                                                    │
                                                                    └→ ingest_spool_receipts (reçus de lot)
```

## Sémantique de rejeu (NFR-REL-001)

- Les collecteurs **écrivent toujours dans le spool** (`Spool::append`, écriture
  synchronisée) ; plus aucune écriture directe non tamponnée.
- Le rejeu pousse par lots de 200 enregistrements, avec un identifiant de lot
  déterministe (`source:premier:dernier:nombre`).
- Les séquences **continuent** après consommation (filigrane persistant
  `{source}.seq`) : une nouvelle génération de spool ne réutilise jamais un
  identifiant de lot déjà émis — le rejeu tardif d'une ancienne génération reste
  un « doublon », une collecte nouvelle produit toujours de nouveaux lots.
- **Sans perte** : le fichier n'est supprimé qu'après succès complet ; après une
  panne, le fichier reste et la tentative suivante reprend.
- **Idempotent** : un lot déjà stocké est détecté via `ingest_spool_receipts` et
  renvoyé en `Duplicate` — rejouer ne duplique pas les données.
- Une ligne finale partielle (écriture interrompue) est ignorée à la lecture ;
  au prochain ajout, la fin incomplète est **nettoyée** avant d'écrire, pour que
  les échantillons suivants restent lisibles et rejoués.
- Un verrou par source empêche deux rejeux simultanés.
- Limite documentée : arrêt brutal **entre** l'insertion des lignes et le reçu →
  fenêtre « au moins une fois » sur le dernier lot ; l'exact-once strict se règle
  côté ClickHouse (`insert_deduplication_token` sur table répliquée).

## Utilisation

```bash
cd crates

# 1. Simuler un collecteur (écrit dans le spool, même si ClickHouse est arrêté)
cargo run -p qinode-ingest --bin simulate_collector -- ./spool/data pdu-edge 30 PDU

# 2. Rejouer vers ClickHouse (une passe, ou boucle toutes les 30 s)
CLICKHOUSE_URL=http://localhost:8123 CLICKHOUSE_DB=dcim \
  cargo run -p qinode-ingest --bin replay_spool -- ./spool/data pdu-edge
CLICKHOUSE_URL=http://localhost:8123 CLICKHOUSE_DB=dcim \
  cargo run -p qinode-ingest --bin replay_spool -- ./spool/data pdu-edge 30000

# 3. Vérifier
curl -s 'http://localhost:8123/?database=dcim' --data-binary \
  "SELECT count() FROM power_metrics"
curl -s 'http://localhost:8123/?database=dcim' --data-binary \
  "SELECT count(), max(received_at) FROM ingest_spool_receipts"
```

## Validation de bout en bout (procédure)

1. ClickHouse démarré (`docker compose up -d`) : simuler 30 échantillons, rejouer
   → `count()` = 30, reçus = 1 lot.
2. **Panne simulée** : couper ClickHouse (ou pointer `CLICKHOUSE_URL` sur un port
   fermé), resimuler 30 échantillons, rejouer → échec visible, spool conservé.
3. Rétablir ClickHouse, rejouer → les 30 échantillons arrivent ; `count()` = 60 ;
   aucun doublon (revérifier après un second rejeu : compteur inchangé).
4. Rejouer deux fois de suite sans panne : second passage « rien à faire ».

Les tests `cargo test -p qinode-ingest` couvrent ces scénarios en local
(succès, panne, reprise, doublons, générations successives, ligne partielle,
verrou, reçus ClickHouse). La reprise d'une seconde génération après
consommation produit bien `count() = 60`, sans doublon.

### Alternative sans Docker (WSL2)

Sur une machine sans Docker, le serveur ClickHouse se lance directement dans WSL2 :

```bash
# dans un shell WSL2 (Ubuntu)
mkdir -p ~/ch-e2e && cd ~/ch-e2e
curl -fsSL https://clickhouse.com/ | sh
./clickhouse server          # HTTP :8123, joignable depuis Windows via localhost
```

Créer les tables (`dcim.power_metrics`, `dcim.ingest_spool_receipts` — cf.
`ensure_schema` dans `crates/qinode-timeseries` et `crates/qinode-ingest`), puis
dérouler la procédure ci-dessus avec `CLICKHOUSE_URL=http://127.0.0.1:8123`.

## État par protocole

| Protocole | Voie d'ingestion | État |
| --- | --- | --- |
| Redfish | client Rust lecture seule (`qinode-ingest`, `snapshot`) | Client prêt ; validation sur BMC réel à planifier |
| SNMP | Telegraf (`ops/telegraf.conf`, OID PDU) | Configuration active (edge) |
| BACnet/IP | Telegraf `inputs.exec` (bloc commenté) | À activer côté site |
| Modbus TCP | Telegraf `inputs.modbus` (bloc commenté) | À activer côté site |

La validation « bout en bout » ci-dessus couvre la chaîne spool → rejeu →
ClickHouse ; la validation sur équipements réels (BMC, PDU, CRAH, groupe froid)
reste à faire sur site et est tracée par les exigences FR-TEL-001/FR-TEL-002.
