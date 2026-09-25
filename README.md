# Next-Generation AI-Driven DCIM Platform

An autonomous, next-generation **Data Center Infrastructure Management (DCIM)** platform designed as a **Cognitive Source of Truth (CSoT)**. Moving beyond passive inventory spreadsheets, this system integrates a native Graph Data Model, real-time power supervision down to individual battery cells, a WebGL 3D Digital Twin, and an air-gapped local AIOps engine.

---

## 🔑 Key Features

- **Dynamic Graph Model (CSoT):** Models physical, electrical, topological, and logical dependencies as a connected graph ($Nodes & Edges$) for immediate blast-radius and cascading impact analysis.
- **3D Digital Twin & AR:** Interactive WebGL 3D visualization of sites, rooms, racks, and thermal/airflow heatmaps directly in the browser, with camera-based Augmented Reality for field technicians.
- **Power Supervision & Battery Management (BMS):** Full electrical chain topology tracking (Grid $\rightarrow$ Generator $\rightarrow$ UPS $\rightarrow$ PDU) and cell-level telemetry ($\text{SoC}%$, $\text{SoH}%$, internal resistance) across VRLA, Li-ion, and BESS systems.
- **Local Air-Gapped AIOps & Copilot:** Natural language interface (NLP), predictive maintenance, early thermal runaway detection, and AI-driven server placement optimization running 100% on-premises.
- **Agentless Discovery:** Automated ingestion via gRPC Telemetry, Modbus TCP, BACnet/IP, eBPF, Redfish, SNMPv3, and LLDP/CDP.

---

## 🏗 System Architecture
