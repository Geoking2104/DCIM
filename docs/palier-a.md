# Palier A livré

| Pièce | Chemin |
|---|---|
| Domaine | `crates/qinode-core` |
| HTTP | `crates/qinode-gateway` :8088 |
| Proxy Next | `web/app/api/metrics/{pue,wue}` |
| UI | `/fr/outils/pue` `/fr/outils/wue` bouton Calculer |
| Compose | service `qinode-gateway` |

Critère : `curl :8088/health` + `cargo test -p qinode-core`.
