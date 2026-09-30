//! Simulateur de collecteur PDU (validation bout-en-bout du spool, sans matériel).
//! Usage : `simulate_collector <répertoire> <source> <nombre> [préfixe-rack]`
//!
//! Les échantillons sont déterministes : mêmes entrées → mêmes lignes, ce qui
//! permet de vérifier le compte exact après rejeu.

use qinode_ingest::spool::{PowerSpoolRow, Spool};

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 4 {
        eprintln!("usage: simulate_collector <répertoire> <source> <nombre> [préfixe-rack]");
        std::process::exit(2);
    }
    let dir = &args[1];
    let source = &args[2];
    let count: usize = args[3].parse().unwrap_or(30);
    let prefix = args.get(4).cloned().unwrap_or_else(|| "RACK".into());
    let spool = Spool::open(dir).expect("ouverture du spool");
    for index in 0..count {
        let load = 40.0 + ((index * 7) % 45) as f64;
        let row = PowerSpoolRow {
            rack_id: format!("{}-{:02}", prefix, (index % 5) + 1),
            grid_power_kw: 100.0 + load,
            ups_power_kw: 90.0 + load * 0.9,
            pdu_power_kw: 80.0 + load * 0.8,
            rack_power_kw: load,
            battery_cell_temp: 22.0 + (index % 5) as f64,
            voltage: 230.0,
        };
        let seq = spool.append(source, &row).expect("ajout au spool");
        println!("[{seq}] {} écrit dans le spool", row.rack_id);
    }
    println!("{count} échantillons prêts dans {dir}/{source}.jsonl");
}
