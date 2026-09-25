//! Palier C — même contrat que Nest (`createRack`, `moveDevice`, …).
//! Store mémoire : remplacer par neo4rs quand Neo4j est là.

use async_graphql::{Context, EmptySubscription, InputObject, Object, Schema, SimpleObject, ID};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

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

#[derive(Default)]
pub struct Store {
    racks: HashMap<String, Rack>,
    devices: HashMap<String, Device>,
}

pub type SharedStore = Arc<RwLock<Store>>;

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

fn hydrate(store: &Store, mut rack: Rack) -> Rack {
    rack.devices = store
        .devices
        .values()
        .filter(|d| d.rack_id.as_deref() == Some(rack.id.as_str()))
        .cloned()
        .collect();
    rack
}

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn racks(&self, ctx: &Context<'_>) -> Vec<Rack> {
        let store = ctx.data_unchecked::<SharedStore>().read().await;
        store.racks.values().map(|r| hydrate(&store, r.clone())).collect()
    }

    async fn rack(&self, ctx: &Context<'_>, id: ID) -> Option<Rack> {
        let store = ctx.data_unchecked::<SharedStore>().read().await;
        store.racks.get(id.as_str()).map(|r| hydrate(&store, r.clone()))
    }
}

pub struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn create_rack(&self, ctx: &Context<'_>, input: CreateRackInput) -> Rack {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        let id = Uuid::new_v4().to_string();
        let rack = Rack {
            id: ID(id.clone()),
            name: input.name,
            height_u: input.height_u,
            site_id: input.site_id,
            devices: vec![],
        };
        store.racks.insert(id, rack.clone());
        rack
    }

    async fn update_rack(&self, ctx: &Context<'_>, input: UpdateRackInput) -> Result<Rack, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        let rack = store
            .racks
            .get_mut(input.id.as_str())
            .ok_or_else(|| format!("Rack {} introuvable", input.id))?;
        if let Some(n) = input.name {
            rack.name = n;
        }
        if let Some(h) = input.height_u {
            rack.height_u = h;
        }
        if let Some(s) = input.site_id {
            rack.site_id = s;
        }
        Ok(hydrate(&store, rack.clone()))
    }

    async fn delete_rack(&self, ctx: &Context<'_>, id: ID) -> Result<bool, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        store.racks.remove(id.as_str()).ok_or_else(|| format!("Rack {id} introuvable"))?;
        store.devices.retain(|_, d| d.rack_id.as_deref() != Some(id.as_str()));
        Ok(true)
    }

    async fn create_device_and_mount(
        &self,
        ctx: &Context<'_>,
        input: CreateDeviceInput,
    ) -> Result<Device, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        if !store.racks.contains_key(&input.rack_id) {
            return Err(format!("Rack {} introuvable", input.rack_id));
        }
        let id = Uuid::new_v4().to_string();
        let device = Device {
            id: ID(id.clone()),
            name: input.name,
            model: input.model,
            start_u: input.start_u,
            height_u: input.height_u,
            rack_id: Some(input.rack_id),
        };
        store.devices.insert(id, device.clone());
        Ok(device)
    }

    async fn update_device(&self, ctx: &Context<'_>, input: UpdateDeviceInput) -> Result<Device, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        let d = store
            .devices
            .get_mut(input.id.as_str())
            .ok_or_else(|| format!("Device {} introuvable", input.id))?;
        if let Some(n) = input.name {
            d.name = n;
        }
        if let Some(m) = input.model {
            d.model = m;
        }
        if let Some(s) = input.start_u {
            d.start_u = s;
        }
        if let Some(h) = input.height_u {
            d.height_u = h;
        }
        Ok(d.clone())
    }

    async fn move_device(&self, ctx: &Context<'_>, input: MoveDeviceInput) -> Result<Device, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        if !store.racks.contains_key(&input.rack_id) {
            return Err(format!("Rack {} introuvable", input.rack_id));
        }
        let d = store
            .devices
            .get_mut(input.device_id.as_str())
            .ok_or_else(|| format!("Device {} introuvable", input.device_id))?;
        d.rack_id = Some(input.rack_id);
        d.start_u = input.start_u;
        Ok(d.clone())
    }

    async fn unmount_device(&self, ctx: &Context<'_>, id: ID) -> Result<bool, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        store
            .devices
            .remove(id.as_str())
            .ok_or_else(|| format!("Device {id} introuvable"))?;
        Ok(true)
    }
}

pub type AppSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;

pub fn schema() -> AppSchema {
    Schema::build(QueryRoot, MutationRoot, EmptySubscription)
        .data(SharedStore::default())
        .finish()
}
