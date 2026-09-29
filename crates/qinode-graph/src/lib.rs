//! Neo4j-backed GraphQL topology with `rackUpdated` / `deviceMounted` subscriptions.

use async_graphql::{Context, Error, InputObject, Object, Schema, SimpleObject, Subscription, ID};
use futures_util::Stream;
use neo4rs::{query, Graph, Row};
use qinode_auth::{Principal, TenantCatalog};
use std::collections::{BTreeMap, BTreeSet};
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

    pub async fn ready(&self) -> Result<(), String> {
        self.run("RETURN 1").await
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

    /// Site d'un rack (`None` si introuvable) — contrôle de périmètre avant mutation.
    async fn rack_site(&self, id: &str) -> Result<Option<String>, String> {
        let mut rows = self
            .graph
            .execute(query("MATCH (r:Rack {id: $id}) RETURN r.site_id AS site_id").param("id", id))
            .await
            .map_err(neo4j_error)?;
        match rows.next().await.map_err(neo4j_error)? {
            Some(row) => Ok(Some(field(&row, "site_id")?)),
            None => Ok(None),
        }
    }

    /// Site du rack d'accueil d'un device (`None` si device absent ou non monté).
    async fn device_site(&self, id: &str) -> Result<Option<String>, String> {
        let mut rows = self
            .graph
            .execute(
                query(
                    "MATCH (d:Device {id: $id}) OPTIONAL MATCH (d)-[:MOUNTED_IN]->(r:Rack) RETURN r.site_id AS site_id",
                )
                .param("id", id),
            )
            .await
            .map_err(neo4j_error)?;
        match rows.next().await.map_err(neo4j_error)? {
            Some(row) => {
                let site: Option<String> = row
                    .get("site_id")
                    .map_err(|error| format!("Champ Neo4j site_id invalide: {error}"))?;
                Ok(site)
            }
            None => Ok(None),
        }
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

/// Périmètre d'autorisation d'un résolveur, dérivé du [`Principal`] injecté par
/// le gateway (miroir des règles du service Nest) :
///
/// - principal anonyme (développement local, `KEYCLOAK_OPTIONAL=true`) ou rôle
///   `qinode-admin` : accès complet ;
/// - sinon : lecture limitée aux sites des tenants listés dans le jeton
///   (catalogue `TENANT_CATALOG`, identité par défaut) ; écriture réservée au
///   rôle `qinode-ops`, suppression (`deleteRack`) au rôle `qinode-admin`,
///   toujours dans le périmètre.
///
/// Fail-closed : sans tenant listé, aucun site n'est accessible.
#[derive(Clone, Debug)]
pub struct ResolverScope {
    unrestricted: bool,
    writable: bool,
    admin: bool,
    sites: BTreeSet<String>,
}

impl ResolverScope {
    fn full_access() -> Self {
        Self {
            unrestricted: true,
            writable: true,
            admin: true,
            sites: BTreeSet::new(),
        }
    }

    pub fn from_principal(principal: &Principal, catalog: &TenantCatalog) -> Self {
        if principal.anonymous || principal.is_admin() {
            return Self::full_access();
        }
        Self {
            unrestricted: false,
            writable: principal.roles.iter().any(|role| role == "qinode-ops"),
            admin: false,
            sites: catalog.sites_for(&principal.tenants),
        }
    }

    pub fn unrestricted(&self) -> bool {
        self.unrestricted
    }

    pub fn sites(&self) -> &BTreeSet<String> {
        &self.sites
    }

    pub fn site_allowed(&self, site: &str) -> bool {
        self.unrestricted || self.sites.contains(site)
    }

    pub fn require_ops(&self) -> Result<(), Error> {
        if self.unrestricted || self.writable {
            Ok(())
        } else {
            Err(Error::new("rôle qinode-ops (ou qinode-admin) requis"))
        }
    }

    pub fn require_admin(&self) -> Result<(), Error> {
        if self.unrestricted || self.admin {
            Ok(())
        } else {
            Err(Error::new("rôle qinode-admin requis"))
        }
    }

    pub fn require_site(&self, site: &str) -> Result<(), Error> {
        if self.site_allowed(site) {
            Ok(())
        } else {
            Err(Error::new(format!("site « {site} » hors périmètre tenant")))
        }
    }
}

/// Extrait le périmètre du contexte GraphQL. Le gateway injecte toujours un
/// `Principal` ; son absence est refusée (fail-closed).
pub fn scope_of(ctx: &Context<'_>) -> Result<ResolverScope, Error> {
    let principal = ctx
        .data_opt::<Principal>()
        .ok_or_else(|| Error::new("authentification requise"))?;
    let catalog = ctx.data_opt::<TenantCatalog>().cloned().unwrap_or_default();
    Ok(ResolverScope::from_principal(principal, &catalog))
}

/// Sites autorisés pour un flux d'abonnement (`None` = pas de restriction ;
/// erreur d'autorisation = ensemble vide, fail-closed).
async fn subscription_sites(ctx: &Context<'_>) -> Option<BTreeSet<String>> {
    match scope_of(ctx) {
        Ok(scope) if scope.unrestricted() => None,
        Ok(scope) => Some(scope.sites().clone()),
        Err(_) => Some(BTreeSet::new()),
    }
}

/// Identifiants de racks autorisés pour les abonnements « device » (`None` = tous).
async fn subscription_rack_ids(ctx: &Context<'_>) -> Option<BTreeSet<String>> {
    let scope = match scope_of(ctx) {
        Ok(scope) => scope,
        Err(_) => return Some(BTreeSet::new()),
    };
    if scope.unrestricted() {
        return None;
    }
    match ctx.data_unchecked::<Neo4jStore>().racks().await {
        Ok(racks) => Some(
            racks
                .into_iter()
                .filter(|rack| scope.site_allowed(&rack.site_id))
                .map(|rack| rack.id.as_str().to_string())
                .collect(),
        ),
        Err(_) => Some(BTreeSet::new()),
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
        let scope = scope_of(ctx)?;
        let racks = ctx
            .data_unchecked::<Neo4jStore>()
            .racks()
            .await
            .map_err(Error::new)?;
        Ok(racks
            .into_iter()
            .filter(|rack| scope.site_allowed(&rack.site_id))
            .collect())
    }

    async fn rack(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<Option<Rack>> {
        let scope = scope_of(ctx)?;
        let rack = ctx
            .data_unchecked::<Neo4jStore>()
            .rack(id.as_str())
            .await
            .map_err(Error::new)?;
        Ok(rack.filter(|rack| scope.site_allowed(&rack.site_id)))
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
        let scope = scope_of(ctx)?;
        scope.require_ops()?;
        scope.require_site(&input.site_id)?;
        let rack = ctx
            .data_unchecked::<Neo4jStore>()
            .create_rack(input)
            .await
            .map_err(Error::new)?;
        emit_rack(ctx, &rack);
        Ok(rack)
    }

    async fn update_rack(
        &self,
        ctx: &Context<'_>,
        input: UpdateRackInput,
    ) -> async_graphql::Result<Rack> {
        let scope = scope_of(ctx)?;
        scope.require_ops()?;
        let store = ctx.data_unchecked::<Neo4jStore>();
        let key = input.id.to_string();
        let current_site = store.rack_site(&key).await.map_err(Error::new)?;
        match current_site {
            Some(site) => scope.require_site(&site)?,
            None => return Err(Error::new(format!("Rack {key} introuvable"))),
        }
        if let Some(site) = input.site_id.as_deref() {
            scope.require_site(site)?;
        }
        let rack = store.update_rack(input).await.map_err(Error::new)?;
        emit_rack(ctx, &rack);
        Ok(rack)
    }

    async fn delete_rack(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<bool> {
        let scope = scope_of(ctx)?;
        scope.require_admin()?;
        let store = ctx.data_unchecked::<Neo4jStore>();
        let site = store.rack_site(id.as_str()).await.map_err(Error::new)?;
        match site {
            Some(site) => scope.require_site(&site)?,
            None => return Err(Error::new(format!("Rack {} introuvable", id.as_str()))),
        }
        store.delete_rack(id.as_str()).await.map_err(Error::new)
    }

    async fn create_device_and_mount(
        &self,
        ctx: &Context<'_>,
        input: CreateDeviceInput,
    ) -> async_graphql::Result<Device> {
        let scope = scope_of(ctx)?;
        scope.require_ops()?;
        let store = ctx.data_unchecked::<Neo4jStore>();
        let rack_id = input.rack_id.clone();
        let site = store.rack_site(&rack_id).await.map_err(Error::new)?;
        match site {
            Some(site) => scope.require_site(&site)?,
            None => return Err(Error::new(format!("Rack {rack_id} introuvable"))),
        }
        let device = store
            .create_device_and_mount(input)
            .await
            .map_err(Error::new)?;
        emit_device(ctx, &device);
        if let Some(rack) = store.rack(&rack_id).await.map_err(Error::new)? {
            emit_rack(ctx, &rack);
        }
        Ok(device)
    }

    async fn update_device(
        &self,
        ctx: &Context<'_>,
        input: UpdateDeviceInput,
    ) -> async_graphql::Result<Device> {
        let scope = scope_of(ctx)?;
        scope.require_ops()?;
        let store = ctx.data_unchecked::<Neo4jStore>();
        let id = input.id.to_string();
        let site = store.device_site(&id).await.map_err(Error::new)?;
        match site {
            Some(site) => scope.require_site(&site)?,
            None => {
                return Err(Error::new(format!(
                    "Device {id} introuvable ou hors périmètre"
                )))
            }
        }
        let device = store.update_device(input).await.map_err(Error::new)?;
        emit_device(ctx, &device);
        Ok(device)
    }

    async fn move_device(
        &self,
        ctx: &Context<'_>,
        input: MoveDeviceInput,
    ) -> async_graphql::Result<Device> {
        let scope = scope_of(ctx)?;
        scope.require_ops()?;
        let store = ctx.data_unchecked::<Neo4jStore>();
        let device_id = input.device_id.to_string();
        let current_site = store.device_site(&device_id).await.map_err(Error::new)?;
        match current_site {
            Some(site) => scope.require_site(&site)?,
            None => {
                return Err(Error::new(format!(
                    "Device {device_id} introuvable ou hors périmètre"
                )))
            }
        }
        let target_site = store.rack_site(&input.rack_id).await.map_err(Error::new)?;
        match target_site {
            Some(site) => scope.require_site(&site)?,
            None => return Err(Error::new(format!("Rack {} introuvable", input.rack_id))),
        }
        let device = store.move_device(input).await.map_err(Error::new)?;
        emit_device(ctx, &device);
        Ok(device)
    }

    async fn unmount_device(&self, ctx: &Context<'_>, id: ID) -> async_graphql::Result<bool> {
        let scope = scope_of(ctx)?;
        scope.require_ops()?;
        let store = ctx.data_unchecked::<Neo4jStore>();
        let site = store.device_site(id.as_str()).await.map_err(Error::new)?;
        match site {
            Some(site) => scope.require_site(&site)?,
            None => {
                return Err(Error::new(format!(
                    "Device {} introuvable ou hors périmètre",
                    id.as_str()
                )))
            }
        }
        store.unmount_device(id.as_str()).await.map_err(Error::new)
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
        let allowed_sites = subscription_sites(ctx).await;
        let rx = ctx.data_unchecked::<Bus>().racks.subscribe();
        let stream = BroadcastStream::new(rx).filter_map(move |res| {
            let rack = res.ok()?;
            if let Some(id) = &rack_id {
                if rack.id.as_str() != id.as_str() {
                    return None;
                }
            }
            if let Some(sites) = &allowed_sites {
                if !sites.contains(&rack.site_id) {
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
        let allowed_racks = subscription_rack_ids(ctx).await;
        let rx = ctx.data_unchecked::<Bus>().devices.subscribe();
        let stream = BroadcastStream::new(rx).filter_map(move |res| {
            let device = res.ok()?;
            if let Some(id) = &rack_id {
                if device.rack_id.as_deref() != Some(id.as_str()) {
                    return None;
                }
            }
            if let Some(racks) = &allowed_racks {
                match device.rack_id.as_deref() {
                    Some(rack) if racks.contains(rack) => {}
                    _ => return None,
                }
            }
            Some(device)
        });
        Box::pin(stream)
    }
}

pub type AppSchema = Schema<QueryRoot, MutationRoot, SubscriptionRoot>;

pub fn schema(store: Neo4jStore) -> AppSchema {
    Schema::build(QueryRoot, MutationRoot, SubscriptionRoot)
        .data(store)
        .data(Bus::new())
        .data(TenantCatalog::from_env())
        .finish()
}

pub async fn schema_from_env() -> Result<AppSchema, String> {
    let store = Neo4jStore::connect_from_env().await?;
    Ok(schema(store))
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

#[cfg(test)]
mod auth_tests {
    use super::*;
    use async_graphql::{EmptyMutation, EmptySubscription};

    fn scoped_principal(roles: &[&str], tenants: &[&str]) -> Principal {
        Principal {
            subject: "test-subject".into(),
            tenants: tenants.iter().map(|value| value.to_string()).collect(),
            roles: roles.iter().map(|value| value.to_string()).collect(),
            anonymous: false,
        }
    }

    fn catalog() -> TenantCatalog {
        TenantCatalog::from_json(
            r#"[{"slug":"paris-east","siteId":"site-paris-01"},{"slug":"lille","siteId":"site-lille-01"}]"#,
        )
    }

    #[test]
    fn anonymous_principal_keeps_local_dev_unrestricted() {
        let scope = ResolverScope::from_principal(&Principal::anonymous(), &catalog());
        assert!(scope.unrestricted());
        assert!(scope.site_allowed("n-importe-quel-site"));
        assert!(scope.require_ops().is_ok());
        assert!(scope.require_admin().is_ok());
    }

    #[test]
    fn admin_is_unrestricted_and_writable() {
        let scope =
            ResolverScope::from_principal(&scoped_principal(&["qinode-admin"], &[]), &catalog());
        assert!(scope.unrestricted());
        assert!(scope.site_allowed("site-lille-01"));
        assert!(scope.require_ops().is_ok());
        assert!(scope.require_admin().is_ok());
    }

    #[test]
    fn ops_is_scoped_to_its_tenants_sites() {
        let principal = scoped_principal(&["qinode-ops"], &["paris-east"]);
        let scope = ResolverScope::from_principal(&principal, &catalog());
        assert!(!scope.unrestricted());
        assert!(scope.site_allowed("site-paris-01"));
        assert!(!scope.site_allowed("site-lille-01"));
        assert!(scope.require_ops().is_ok());
        assert!(scope.require_site("site-paris-01").is_ok());
        // Test négatif inter-tenant : l'écriture hors périmètre est refusée.
        let denied = scope
            .require_site("site-lille-01")
            .expect_err("inter-tenant refusé");
        assert!(denied.message.contains("hors périmètre"));
        assert!(scope.require_admin().is_err());
    }

    #[test]
    fn viewer_reads_within_scope_but_cannot_write() {
        let scope = ResolverScope::from_principal(
            &scoped_principal(&["qinode-viewer"], &["lille"]),
            &catalog(),
        );
        assert!(scope.site_allowed("site-lille-01"));
        assert!(!scope.site_allowed("site-paris-01"));
        assert!(scope.require_ops().is_err());
    }

    #[test]
    fn principal_without_tenants_is_fail_closed() {
        let scope =
            ResolverScope::from_principal(&scoped_principal(&["qinode-ops"], &[]), &catalog());
        assert!(!scope.site_allowed("site-paris-01"));
        assert!(!scope.site_allowed(""));
    }

    struct ScopeProbe;

    #[Object]
    impl ScopeProbe {
        async fn scope_probe(&self, ctx: &Context<'_>) -> async_graphql::Result<String> {
            let scope = scope_of(ctx)?;
            Ok(if scope.unrestricted() {
                "unrestricted".to_string()
            } else {
                "scoped".to_string()
            })
        }
    }

    #[tokio::test]
    async fn resolver_context_requires_a_principal() {
        let schema = Schema::build(ScopeProbe, EmptyMutation, EmptySubscription).finish();
        let response = schema.execute("{ scopeProbe }").await;
        let error = response.errors.first().expect("erreur attendue");
        assert!(error.message.contains("authentification requise"));
    }

    #[tokio::test]
    async fn resolver_context_reads_scope_from_injected_data() {
        let schema = Schema::build(ScopeProbe, EmptyMutation, EmptySubscription)
            .data(scoped_principal(&["qinode-ops"], &["paris-east"]))
            .data(catalog())
            .finish();
        let response = schema.execute("{ scopeProbe }").await;
        assert!(response.errors.is_empty(), "{:?}", response.errors);
        let data = response.data.into_json().expect("json");
        assert_eq!(data["scopeProbe"].as_str(), Some("scoped"));
    }
}
