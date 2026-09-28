use qinode_graph::schema_from_env;

#[tokio::test]
async fn topology_survives_schema_recreation() {
    if std::env::var("QINODE_NEO4J_INTEGRATION").as_deref() != Ok("true") {
        return;
    }

    let schema = schema_from_env().await.expect("connect initial schema");
    let created = schema
        .execute(
            r#"mutation {
                createRack(input: {name: "CI-RACK", heightU: 42, siteId: "ci"}) {
                    id
                }
            }"#,
        )
        .await;
    assert!(created.errors.is_empty(), "{:?}", created.errors);
    let created = created.data.into_json().expect("rack response JSON");
    let rack_id = created["createRack"]["id"]
        .as_str()
        .expect("created rack id")
        .to_string();

    let mounted = schema
        .execute(format!(
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
        .await;
    assert!(mounted.errors.is_empty(), "{:?}", mounted.errors);
    drop(schema);

    let restarted = schema_from_env().await.expect("reconnect schema");
    let persisted = restarted
        .execute(format!(
            r#"query {{
                rack(id: "{rack_id}") {{
                    id
                    name
                    devices {{ name rackId }}
                }}
            }}"#
        ))
        .await;
    assert!(persisted.errors.is_empty(), "{:?}", persisted.errors);
    let persisted = persisted.data.into_json().expect("persisted rack JSON");
    assert_eq!(persisted["rack"]["id"], rack_id);
    assert_eq!(persisted["rack"]["name"], "CI-RACK");
    assert_eq!(persisted["rack"]["devices"][0]["name"], "CI-SERVER");
    assert_eq!(persisted["rack"]["devices"][0]["rackId"], rack_id);

    let deleted = restarted
        .execute(format!(r#"mutation {{ deleteRack(id: "{rack_id}") }}"#))
        .await;
    assert!(deleted.errors.is_empty(), "{:?}", deleted.errors);
}
