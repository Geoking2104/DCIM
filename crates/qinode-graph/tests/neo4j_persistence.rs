use async_graphql::Request;
use qinode_auth::Principal;
use qinode_graph::schema_from_env;

/// L'autorisation par resolver exige un `Principal` par requête (le gateway
/// l'injecte depuis le porteur). Ce test injecte les mêmes données de contexte :
/// - parcours principal : opérateur limité au site `ci` (catalogue absent →
///   identité, donc `ci` ∈ périmètre) ;
/// - suppression : rôle `qinode-admin` requis par `deleteRack`.
fn scoped_ops() -> Principal {
    Principal {
        subject: "ci-integration".into(),
        tenants: vec!["ci".into()],
        roles: vec!["qinode-ops".into()],
        anonymous: false,
    }
}

fn admin() -> Principal {
    Principal {
        subject: "ci-integration-admin".into(),
        tenants: vec![],
        roles: vec!["qinode-admin".into()],
        anonymous: false,
    }
}

#[tokio::test]
async fn topology_survives_schema_recreation() {
    if std::env::var("QINODE_NEO4J_INTEGRATION").as_deref() != Ok("true") {
        return;
    }

    let schema = schema_from_env().await.expect("connect initial schema");
    let created = schema
        .execute(
            Request::new(
                r#"mutation {
                    createRack(input: {name: "CI-RACK", heightU: 42, siteId: "ci"}) {
                        id
                    }
                }"#,
            )
            .data(scoped_ops()),
        )
        .await;
    assert!(created.errors.is_empty(), "{:?}", created.errors);
    let created = created.data.into_json().expect("rack response JSON");
    let rack_id = created["createRack"]["id"]
        .as_str()
        .expect("created rack id")
        .to_string();

    let mounted = schema
        .execute(
            Request::new(format!(
                r#"mutation {{
                    createDeviceAndMount(input: {{
                        name: "CI-SERVER",
                        model: "integration-test",
                        startU: 10,
                        heightU: 2,
                        rackId: "{rack_id}"
                    }}) {{
                        id
                        rackId
                    }}
                }}"#
            ))
            .data(scoped_ops()),
        )
        .await;
    assert!(mounted.errors.is_empty(), "{:?}", mounted.errors);
    drop(schema);

    let restarted = schema_from_env().await.expect("reconnect schema");
    let persisted = restarted
        .execute(
            Request::new(format!(
                r#"query {{
                    rack(id: "{rack_id}") {{
                        id
                        name
                        devices {{ name rackId }}
                    }}
                }}"#
            ))
            .data(scoped_ops()),
        )
        .await;
    assert!(persisted.errors.is_empty(), "{:?}", persisted.errors);
    let persisted = persisted.data.into_json().expect("persisted rack JSON");
    assert_eq!(persisted["rack"]["id"], rack_id);
    assert_eq!(persisted["rack"]["name"], "CI-RACK");
    assert_eq!(persisted["rack"]["devices"][0]["name"], "CI-SERVER");
    assert_eq!(persisted["rack"]["devices"][0]["rackId"], rack_id);

    let deleted = restarted
        .execute(
            Request::new(format!(r#"mutation {{ deleteRack(id: "{rack_id}") }}"#)).data(admin()),
        )
        .await;
    assert!(deleted.errors.is_empty(), "{:?}", deleted.errors);
}

/// Pendant la période de lecture parallèle Nest/Rust, des nœuds créés par
/// l'ancien service portent des propriétés camelCase (et des nombres en
/// flottants). La lecture doit les présenter sans échouer — et sans casser la
/// liste complète — ni exiger une migration préalable.
#[tokio::test]
async fn rack_reads_bridge_legacy_camelcase_properties() {
    if std::env::var("QINODE_NEO4J_INTEGRATION").as_deref() != Ok("true") {
        return;
    }
    let uri = std::env::var("NEO4J_URI").expect("NEO4J_URI");
    let user = std::env::var("NEO4J_USER").expect("NEO4J_USER");
    let password = std::env::var("NEO4J_PASSWORD").expect("NEO4J_PASSWORD");
    let graph = neo4rs::Graph::new(&uri, &user, &password)
        .await
        .expect("connect neo4j");

    let legacy_id = "LEGACY-RACK-01";
    graph
        .run(
            neo4rs::query(
                "MERGE (r:Rack {id: $id}) SET r.name = 'Legacy rack', r.heightU = 42.0, r.siteId = 'PAR-1'",
            )
            .param("id", legacy_id),
        )
        .await
        .expect("seed legacy node");

    let schema = schema_from_env().await.expect("schema");
    let response = schema
        .execute(Request::new(r#"query { racks { id name heightU siteId } }"#).data(admin()))
        .await;
    assert!(response.errors.is_empty(), "{:?}", response.errors);
    let data = response.data.into_json().expect("json");
    let racks = data["racks"].as_array().expect("racks array");
    let legacy = racks
        .iter()
        .find(|rack| rack["id"] == legacy_id)
        .expect("legacy rack présent via le bridge camelCase");
    assert_eq!(legacy["heightU"], 42);
    assert_eq!(legacy["siteId"], "PAR-1");

    graph
        .run(neo4rs::query("MATCH (r:Rack {id: $id}) DELETE r").param("id", legacy_id))
        .await
        .expect("cleanup legacy node");
}
