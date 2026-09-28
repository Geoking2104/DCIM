//! Neo4j-backed GraphQL topology with `rackUpdated` / `deviceMounted` subscriptions.

use async_graphql::{Context, InputObject, Object, Schema, SimpleObject, Subscription, ID};
use futures_util::Stream;
use neo4rs::{query, Graph, Row};
use std::collections::BTreeMap;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt;
use uuid::Uuid;

const RACK_FIELDS: &str =
    "r.id AS rack_id, r.name AS rack_name, r.height_u AS rack_height_u, r.site_id AS rack_site_id";
const DEVICE_FIELDS: &str = "d.id AS device_id, d.name AS device_name, d.model AS device_model, d.start_u AS device_start_u, d.height_u AS device_height_u, rack.id AS device_rack_id";

#[derive(Clone, SimpleObject)]
pub struct Device {
    pub id: ID,
    pub name: String,
    pub model: String,
    pub start_u: i32,
    pub height_u: i32,
    pub rack_id: Option<String>,
}

#[derive(Clone, SimpleObject)]
pub struct Rack {
    pub id: ID,
    pub name: String,
    pub height_u: i32,
    pub site_id: String,
    pub devices: Vec<Device>,
}

#[derive(Clone)]
pub struct Neo4jStore {
    graph: Arc<Graph>,
}

impl Neo4jStore {
    pub async fn connect_from_env() -> Result<Self, String> {
        let uri = required_env("NEO4J_URI")?;
        let user = required_env("NEO4J_USER")?;
        let password = required_env("NEO4J_PASSWORD")?;
        let graph = Graph::new(&uri, &user, &password)
            .await
            .map_err(|error| format!("Connexion Neo4j impossible ({uri}): {error}"))?;
        let store = Self {
            graph: Arc::new(graph),
        };
        store.ensure_schema().await?;
        Ok(store)
    }

    async fn ensure_schema(&self) -> Result<(), String> {
        self.run(
            "CREATE CONSTRAINT rack_id_unique IF NOT EXISTS FOR (r:Rack) REQUIRE r.id IS UNIQUE",
        )
        .await?;
        self.run("CREATE CONSTRAINT device_id_unique IF NOT EXISTS FOR (d:Device) REQUIRE d.id IS UNIQUE")
            .await
    }

    async fn run(&self, cypher: &str) -> Result<(), String> {
        self.graph.run(query(cypher)).await.map_err(neo4j_error)
    }

    async fn racks(&self) -> Result<Vec<Rack>, String> {
        let cypher = format!(
            "MATCH (r:Rack) OPTIONAL MATCH (d:Device)-[:MOUNTED_IN]->(r) RETURN {RACK_FIELDS}, d.id AS device_id, d.name AS device_name, d.model AS device_model, d.start_u AS device_start_u, d.height_u AS device_height_u ORDER BY r.id, d.id"
        );
        let mut rows = self
            .graph
            .execute(query(&cypher))
            .await
            .map_err(neo4j_error)?;
        let mut racks = BTreeMap::<String, Rack>::new();

        while let Some(row) = rows.next().await.map_err(neo4j_error)? {
            let rack_id: String = field(&row, "rack_id")?;
            let rack = racks.entry(rack_id.clone()).or_insert(Rack {
                id: ID(rack_id.clone()),
                name: field(&row, "rack_name")?,
                height_u: int_field(&row, "rack_height_u")?,
                site_id: field(&row, "rack_site_id")?,
                devices: vec![],
            });
            if let Some(device) = optional_device(&row, Some(rack_id))? {
                rack.devices.push(device);
            }
        }
        Ok(racks.into_values().collect())
    }

    async fn rack(&self, id: &str) -> Result<Option<Rack>, String> {
        let cypher = format!(
            "MATCH (r:Rack {{id: $id}}) OPTIONAL MATCH (d:Device)-[:MOUNTED_IN]->(r) RETURN {RACK_FIELDS}, d.id AS device_id, d.name AS device_name, d.model AS device_model, d.start_u AS device_start_u, d.height_u AS device_height_u ORDER BY d.id"
        );
        let mut rows = self
            .graph
            .execute(query(&cypher).param("id", id))
            .await
            .map_err(neo4j_error)?;
        let mut rack: Option<Rack> = None;

        while let Some(row) = rows.next().await.map_err(neo4j_error)? {
            let rack_id: String = field(&row, "rack_id")?;
            let current = rack.get_or_insert(Rack {
                id: ID(rack_id.clone()),
                name: field(&row, "rack_name")?,
                height_u: int_field(&row, "rack_height_u")?,
                site_id: field(&row, "rack_site_id")?,
                devices: vec![],
            });
            if let Some(device) = optional_device(&row, Some(rack_id))? {
                current.devices.push(device);
            }
        }
        Ok(rack)
    }

    async fn create_rack(&self, input: CreateRackInput) -> Result<Rack, String> {
        let rack = Rack {
            id: ID(Uuid::new_v4().to_string()),
            name: input.name,
            height_u: input.height_u,
            site_id: input.site_id,
            devices: vec![],
        };
        self.graph
            .run(
                query(
                    "CREATE (:Rack {id: $id, name: $name, height_u: $height_u, site_id: $site_id})",
                )
                .param("id", rack.id.as_str())
                .param("name", rack.name.as_str())
                .param("height_u", i64::from(rack.height_u))
                .param("site_id", rack.site_id.as_str()),
            )
            .await
            .map_err(neo4j_error)?;
        Ok(rack)
    }

    async fn update_rack(&self, input: UpdateRackInput) -> Result<Rack, String> {
        let key = input.id.to_string();
        let mut rows = self
            .graph
            .execute(
                query(
                    "MATCH (r:Rack {id: $id}) SET r.name = coalesce($name, r.name), r.height_u = coalesce($height_u, r.height_u), r.site_id = coalesce($site_id, r.site_id) RETURN r.id AS rack_id",
                )
                .param("id", key.as_str())
                .param("name", input.name)
                .param("height_u", input.height_u.map(i64::from))
                .param("site_id", input.site_id),
            )
            .await
            .map_err(neo4j_error)?;
        if rows.next().await.map_err(neo4j_error)?.is_none() {
            return Err(format!("Rack {key} introuvable"));
        }
        self.rack(&key)
            .await?
            .ok_or_else(|| format!("Rack {key} introuvable"))
    }

    async fn delete_rack(&self, id: &str) -> Result<bool, String> {
        let mut rows = self
            .graph
            .execute(
                query(
                    "MATCH (r:Rack {id: $id}) OPTIONAL MATCH (d:Device)-[:MOUNTED_IN]->(r) WITH r, collect(d) AS devices FOREACH (device IN devices | DETACH DELETE device) DETACH DELETE r RETURN true AS deleted",
                )
                .param("id", id),
            )
            .await
            .map_err(neo4j_error)?;
        if rows.next().await.map_err(neo4j_error)?.is_some() {
            Ok(true)
        } else {
            Err(format!("Rack {id} introuvable"))
        }
    }

    async fn create_device_and_mount(&self, input: CreateDeviceInput) -> Result<Device, String> {
        let id = Uuid::new_v4().to_string();
        let rack_id = input.rack_id.clone();
        let cypher = format!(
            "MATCH (rack:Rack {{id: $rack_id}}) CREATE (d:Device {{id: $id, name: $name, model: $model, start_u: $start_u, height_u: $height_u}})-[:MOUNTED_IN]->(rack) RETURN {DEVICE_FIELDS}"
        );
        let mut rows = self
            .graph
            .execute(
                query(&cypher)
                    .param("rack_id", rack_id.as_str())
                    .param("id", id)
                    .param("name", input.name)
                    .param("model", input.model)
                    .param("start_u", i64::from(input.start_u))
                    .param("height_u", i64::from(input.height_u)),
            )
            .await
            .map_err(neo4j_error)?;
        let row = rows
            .next()
            .await
            .map_err(neo4j_error)?
            .ok_or_else(|| format!("Rack {rack_id} introuvable"))?;
        device(&row)
    }

    async fn update_device(&self, input: UpdateDeviceInput) -> Result<Device, String> {
        let key = input.id.to_string();
        let cypher = format!(
            "MATCH (d:Device {{id: $id}}) OPTIONAL MATCH (d)-[:MOUNTED_IN]->(rack:Rack) SET d.name = coalesce($name, d.name), d.model = coalesce($model, d.model), d.start_u = coalesce($start_u, d.start_u), d.height_u = coalesce($height_u, d.height_u) RETURN {DEVICE_FIELDS}"
        );
        let mut rows = self
            .graph
            .execute(
                query(&cypher)
                    .param("id", key.as_str())
                    .param("name", input.name)
                    .param("model", input.model)
                    .param("start_u", input.start_u.map(i64::from))
                    .param("height_u", input.height_u.map(i64::from)),
            )
            .await
            .map_err(neo4j_error)?;
        let row = rows
            .next()
            .await
            .map_err(neo4j_error)?
            .ok_or_else(|| format!("Device {key} introuvable"))?;
        device(&row)
    }

    async fn move_device(&self, input: MoveDeviceInput) -> Result<Device, String> {
        let device_id = input.device_id.to_string();
        let rack_id = input.rack_id;
        let cypher = format!(
            "MATCH (d:Device {{id: $device_id}}), (rack:Rack {{id: $rack_id}}) OPTIONAL MATCH (d)-[old:MOUNTED_IN]->(:Rack) DELETE old CREATE (d)-[:MOUNTED_IN]->(rack) SET d.start_u = $start_u RETURN {DEVICE_FIELDS}"
        );
        let mut rows = self
            .graph
            .execute(
                query(&cypher)
                    .param("device_id", device_id.as_str())
                    .param("rack_id", rack_id.as_str())
                    .param("start_u", i64::from(input.start_u)),
            )
            .await
            .map_err(neo4j_error)?;
        let row = rows
            .next()
            .await
            .map_err(neo4j_error)?
            .ok_or_else(|| format!("Device {device_id} ou rack {rack_id} introuvable"))?;
        device(&row)
    }

    async fn unmount_device(&self, id: &str) -> Result<bool, String> {
        let mut rows = self
            .graph
            .execute(
                query("MATCH (d:Device {id: $id}) DETACH DELETE d RETURN true AS deleted")
                    .param("id", id),
            )
            .await
            .map_err(neo4j_error)?;
        if rows.next().await.map_err(neo4j_error)?.is_some() {
            Ok(true)
        } else {
            Err(format!("Device {id} introuvable"))
        }
    }
}

fn required_env(name: &str) -> Result<String, String> {
    std::env::var(name)
        .ok()
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| format!("Variable {name} requise pour le stockage topologique Neo4j"))
}

fn neo4j_error(error: impl std::fmt::Display) -> String {
    format!("Échec Neo4j: {error}")
}

fn field<T>(row: &Row, name: &str) -> Result<T, String>
where
    T: serde::de::DeserializeOwned,
{
    row.get(name)
        .map_err(|error| format!("Champ Neo4j {name} invalide: {error}"))
}

fn int_field(row: &Row, name: &str) -> Result<i32, String> {
    let value: i64 = row
        .get(name)
        .map_err(|error| format!("Champ Neo4j {name} invalide: {error}"))?;
    i32::try_from(value).map_err(|_| format!("Champ Neo4j {name} hors limites: {value}"))
}

fn optional_device(row: &Row, rack_id: Option<String>) -> Result<Option<Device>, String> {
    let id: Option<String> = row
        .get("device_id")
        .map_err(|error| format!("Champ Neo4j device_id invalide: {error}"))?;
    let Some(id) = id else {
        return Ok(None);
    };
    Ok(Some(Device {
        id: ID(id),
        name: field(row, "device_name")?,
        model: field(row, "device_model")?,
        start_u: int_field(row, "device_start_u")?,
        height_u: int_field(row, "device_height_u")?,
        rack_id,
    }))
}

fn device(row: &Row) -> Result<Device, String> {
    let rack_id: Option<String> = row
        .get("device_rack_id")
        .map_err(|error| format!("Champ Neo4j device_rack_id invalide: {error}"))?;
    optional_device(row, rack_id)?.ok_or_else(|| "Device Neo4j incomplet".to_string())
}

#[derive(Clone)]
pub struct Bus {
    pub racks: broadcast::Sender<Rack>,
    pub devices: broadcast::Sender<Device>,
}

impl Bus {
    pub fn new() -> Self {
        let (racks, _) = broadcast::channel(64);
        let (devices, _) = broadcast::channel(64);
        Self { racks, devices }
    }
}

impl Default for Bus {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(InputObject)]
struct CreateRackInput {
    name: String,
    height_u: i32,
    site_id: String,
}

#[derive(InputObject)]
struct UpdateRackInput {
    id: ID,
    name: Option<String>,
    height_u: Option<i32>,
    site_id: Option<String>,
}

#[derive(InputObject)]
struct CreateDeviceInput {
    name: String,
    model: String,
    start_u: i32,
    height_u: i32,
    rack_id: String,
}

#[derive(InputObject)]
struct UpdateDeviceInput {
    id: ID,
    name: Option<String>,
    model: Option<String>,
    start_u: Option<i32>,
    height_u: Option<i32>,
}

#[derive(InputObject)]
struct MoveDeviceInput {
    device_id: ID,
    rack_id: String,
    start_u: i32,
}

fn emit_rack(ctx: &Context<'_>, rack: &Rack) {
    let _ = ctx.data_unchecked::<Bus>().racks.send(rack.clone());
}

fn emit_device(ctx: &Context<'_>, device: &Device) {
    let _ = ctx.data_unchecked::<Bus>().devices.send(device.clone());
}

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn racks(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<Rack>> {
        ctx.data_unchecked::<Neo4jStore>()
            .racks()
            .await
            .map_err(async_graphql::Error::new)
    }

    async fn rack(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<Option<Rack>> {
        ctx.data_unchecked::<Neo4jStore>()
            .rack(id.as_str())
            .await
            .map_err(async_graphql::Error::new)
    }
}

pub struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn create_rack(
        &self,
        ctx: &Context<'_>,
        input: CreateRackInput,
    ) -> async_graphql::Result<Rack> {
        let rack = ctx
            .data_unchecked::<Neo4jStore>()
            .create_rack(input)
            .await
            .map_err(async_graphql::Error::new)?;
        emit_rack(ctx, &rack);
        Ok(rack)
    }

    async fn update_rack(
        &self,
        ctx: &Context<'_>,
        input: UpdateRackInput,
    ) -> async_graphql::Result<Rack> {
        let rack = ctx
            .data_unchecked::<Neo4jStore>()
            .update_rack(input)
            .await
            .map_err(async_graphql::Error::new)?;
        emit_rack(ctx, &rack);
        Ok(rack)
    }

    async fn delete_rack(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<bool> {
        ctx.data_unchecked::<Neo4jStore>()
            .delete_rack(id.as_str())
            .await
            .map_err(async_graphql::Error::new)
    }

    async fn create_device_and_mount(
        &self,
        ctx: &Context<'_>,
        input: CreateDeviceInput,
    ) -> async_graphql::Result<Device> {
        let store = ctx.data_unchecked::<Neo4jStore>();
        let rack_id = input.rack_id.clone();
        let device = store
            .create_device_and_mount(input)
            .await
            .map_err(async_graphql::Error::new)?;
        emit_device(ctx, &device);
        if let Some(rack) = store
            .rack(&rack_id)
            .await
            .map_err(async_graphql::Error::new)?
        {
            emit_rack(ctx, &rack);
        }
        Ok(device)
    }

    async fn update_device(
        &self,
        ctx: &Context<'_>,
        input: UpdateDeviceInput,
    ) -> async_graphql::Result<Device> {
        let device = ctx
            .data_unchecked::<Neo4jStore>()
            .update_device(input)
            .await
            .map_err(async_graphql::Error::new)?;
        emit_device(ctx, &device);
        Ok(device)
    }

    async fn move_device(
        &self,
        ctx: &Context<'_>,
        input: MoveDeviceInput,
    ) -> async_graphql::Result<Device> {
        let device = ctx
            .data_unchecked::<Neo4jStore>()
            .move_device(input)
            .await
            .map_err(async_graphql::Error::new)?;
        emit_device(ctx, &device);
        Ok(device)
    }

    async fn unmount_device(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<bool> {
        ctx.data_unchecked::<Neo4jStore>()
            .unmount_device(id.as_str())
            .await
            .map_err(async_graphql::Error::new)
    }
}

pub struct SubscriptionRoot;

#[Subscription]
impl SubscriptionRoot {
    async fn rack_updated(
        &self,
        ctx: &Context<'_>,
        rack_id: Option<ID>,
    ) -> Pin<Box<dyn Stream<Item = Rack> + Send>> {
        let rx = ctx.data_unchecked::<Bus>().racks.subscribe();
        let stream = BroadcastStream::new(rx).filter_map(move |res| {
            let rack = res.ok()?;
            if let Some(id) = &rack_id {
                if rack.id.as_str() != id.as_str() {
                    return None;
                }
            }
            Some(rack)
        });
        Box::pin(stream)
    }

    async fn device_mounted(
        &self,
        ctx: &Context<'_>,
        rack_id: Option<ID>,
    ) -> Pin<Box<dyn Stream<Item = Device> + Send>> {
        let rx = ctx.data_unchecked::<Bus>().devices.subscribe();
        let stream = BroadcastStream::new(rx).filter_map(move |res| {
            let device = res.ok()?;
            if let Some(id) = &rack_id {
                if device.rack_id.as_deref() != Some(id.as_str()) {
                    return None;
                }
            }
            Some(device)
        });
        Box::pin(stream)
    }
}

pub type AppSchema = Schema<QueryRoot, MutationRoot, SubscriptionRoot>;

pub async fn schema_from_env() -> Result<AppSchema, String> {
    let store = Neo4jStore::connect_from_env().await?;
    Ok(Schema::build(QueryRoot, MutationRoot, SubscriptionRoot)
        .data(store)
        .data(Bus::new())
        .finish())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_neo4j_configuration_is_explicit() {
        let missing = "QINODE_TEST_MISSING_NEO4J_VALUE";
        std::env::remove_var(missing);
        assert_eq!(
            required_env(missing),
            Err(format!(
                "Variable {missing} requise pour le stockage topologique Neo4j"
            ))
        );
    }

    #[test]
    fn empty_neo4j_configuration_is_rejected() {
        let missing = "QINODE_TEST_EMPTY_NEO4J_VALUE";
        std::env::set_var(missing, "  ");
        assert!(required_env(missing).is_err());
        std::env::remove_var(missing);
    }
}
