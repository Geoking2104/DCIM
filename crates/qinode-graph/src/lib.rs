//! GraphQL HTTP + subscriptions `rackUpdated` / `deviceMounted`.

use async_graphql::{
    Context, InputObject, Object, Schema, SimpleObject, Subscription, ID,
};
use futures_util::Stream;
use std::collections::HashMap;
use std::pin::Pin;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt;
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
    let rid = rack.id.as_str().to_string();
    rack.devices = store
        .devices
        .values()
        .filter(|d| d.rack_id.as_deref() == Some(rid.as_str()))
        .cloned()
        .collect();
    rack
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
        emit_rack(ctx, &rack);
        rack
    }

    async fn update_rack(&self, ctx: &Context<'_>, input: UpdateRackInput) -> Result<Rack, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        let key = input.id.to_string();
        {
            let rack = store.racks.get_mut(&key).ok_or_else(|| format!("Rack {key} introuvable"))?;
            if let Some(n) = input.name { rack.name = n; }
            if let Some(h) = input.height_u { rack.height_u = h; }
            if let Some(s) = input.site_id { rack.site_id = s; }
        }
        let rack = hydrate(&store, store.racks.get(&key).cloned().unwrap());
        emit_rack(ctx, &rack);
        Ok(rack)
    }

    async fn delete_rack(&self, ctx: &Context<'_>, id: ID) -> Result<bool, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        store.racks.remove(id.as_str()).ok_or_else(|| format!("Rack {id} introuvable"))?;
        store.devices.retain(|_, d| d.rack_id.as_deref() != Some(id.as_str()));
        Ok(true)
    }

    async fn create_device_and_mount(&self, ctx: &Context<'_>, input: CreateDeviceInput) -> Result<Device, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        if !store.racks.contains_key(&input.rack_id) {
            return Err(format!("Rack {} introuvable", input.rack_id));
        }
        let rack_id = input.rack_id.clone();
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
        emit_device(ctx, &device);
        if let Some(r) = store.racks.get(&rack_id) {
            emit_rack(ctx, &hydrate(&store, r.clone()));
        }
        Ok(device)
    }

    async fn update_device(&self, ctx: &Context<'_>, input: UpdateDeviceInput) -> Result<Device, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        let d = store.devices.get_mut(input.id.as_str()).ok_or_else(|| format!("Device {} introuvable", input.id))?;
        if let Some(n) = input.name { d.name = n; }
        if let Some(m) = input.model { d.model = m; }
        if let Some(s) = input.start_u { d.start_u = s; }
        if let Some(h) = input.height_u { d.height_u = h; }
        let device = d.clone();
        emit_device(ctx, &device);
        Ok(device)
    }

    async fn move_device(&self, ctx: &Context<'_>, input: MoveDeviceInput) -> Result<Device, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        if !store.racks.contains_key(&input.rack_id) {
            return Err(format!("Rack {} introuvable", input.rack_id));
        }
        let d = store.devices.get_mut(input.device_id.as_str()).ok_or_else(|| format!("Device {} introuvable", input.device_id))?;
        d.rack_id = Some(input.rack_id);
        d.start_u = input.start_u;
        let device = d.clone();
        emit_device(ctx, &device);
        Ok(device)
    }

    async fn unmount_device(&self, ctx: &Context<'_>, id: ID) -> Result<bool, String> {
        let mut store = ctx.data_unchecked::<SharedStore>().write().await;
        store.devices.remove(id.as_str()).ok_or_else(|| format!("Device {id} introuvable"))?;
        Ok(true)
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

pub fn schema() -> AppSchema {
    Schema::build(QueryRoot, MutationRoot, SubscriptionRoot)
        .data(SharedStore::default())
        .data(Bus::new())
        .finish()
}
