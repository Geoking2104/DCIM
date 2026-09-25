# Regulatory Compliance Baseline

| Field | Value |
| --- | --- |
| Baseline date | 25 September 2026 |
| Version | 1.0 |
| Purpose | Product requirements and traceability; not legal advice |

## 1. Status rules

The platform separates four states: `draft`, `adopted-not-yet-in-force`, `in-force`, and `superseded`. Each regulatory rule stores its jurisdiction, source URL, legal identifier, publication and effective dates, applicability criteria, formula version, and reviewer.

Where national law is stricter than the EU baseline, the national rule applies only to assets within its jurisdiction. Regulatory content must be reviewed by qualified counsel before a production filing.

## 2. European data-centre reporting

| Instrument | Product interpretation | Required platform behavior |
| --- | --- | --- |
| Directive (EU) 2023/1791, Article 12 and Annex VII | Member States require reporting for data centres with installed IT power demand of at least 500 kW, subject to the Directive's scope and exceptions. | Determine applicability per facility and reporting period; retain the decision and supporting capacity evidence. |
| Delegated Regulation (EU) 2024/1364, Annexes I-II | Defines the information and KPI data to communicate to the European database. | Maintain a versioned data dictionary, completeness checks, validation and schema-specific exports. |
| Delegated Regulation (EU) 2024/1364, Annex III | Defines KPI calculations including PUE, WUE, ERF, REF and related indicators. | Use versioned formulas, units, boundaries and audit evidence; never silently revise a filed period. |
| Annual reporting process | Initial reporting occurred in 2024; subsequent annual reporting is due through Member State workflows. | Make deadlines configurable, generate a locked annual snapshot, record approvals, submission receipt and corrections. |

The engine may calculate CUE and other customer metrics, but it must not attribute a formula to Regulation 2024/1364 unless that formula is actually defined there.

## 3. PUE and WUE A-G rating

The European Commission adopted `C(2026) 3472 final` on 21 September 2026. At this baseline date, publication in the Official Journal and entry into force must still be verified. The rule set therefore remains `adopted-not-yet-in-force` until the legal monitor records the authoritative Official Journal reference.

The adopted amendment also changes WUE from total water input divided by IT energy in MWh to freshwater input divided by IT energy in kWh, and adds a Low-Emission Energy Factor (LEEF). The platform must preserve both definitions and select them by reporting-period rule set; it must not retroactively apply the future formula to a locked period.

The adopted text creates **separate** A-G ratings for PUE and WUE. The internal preview thresholds are:

| Grade | PUE | WUE |
| --- | --- | --- |
| A | `<= 1.15` | `<= 0.1` |
| B | `> 1.15` and `<= 1.25` | `> 0.1` and `<= 0.2` |
| C | `> 1.25` and `<= 1.35` | `> 0.2` and `<= 0.4` |
| D | `> 1.35` and `<= 1.50` | `> 0.4` and `<= 0.6` |
| E | `> 1.50` and `<= 1.70` | `> 0.6` and `<= 0.8` |
| F | `> 1.70` and `<= 1.90` | `> 0.8` and `<= 1.0` |
| G | `> 1.90` | `> 1.0` |

The Commission text requires the official electronic label to be generated from the European database and envisages the first labels by 15 August 2027, with annual updates thereafter. Product controls must therefore:

- label internal calculations as `preview` and `official=false`;
- display the relevant rule-set version and legal-status warning;
- prohibit use of the EU label design or any representation likely to be confused with it;
- ingest, preserve and display the official database-generated label and QR code;
- reconcile preview and official values without overwriting either record;
- monitor Official Journal publication and update the effective date through controlled review.

## 4. Waste-heat recovery

Directive (EU) 2023/1791 Article 26 requires Member States to ensure that data centres with total rated energy input above 1 MW use waste heat or another heat-recovery application unless the prescribed assessment shows that this is not technically or economically feasible.

The platform records rated energy input, applicability, feasibility assessment, reviewer, recoverable heat, exported heat, thermal power, temperature levels, consumer/network, seasonal demand, outages, costs, agreements, and exemptions. It also records whether the facility is `waste-heat-reuse-ready`, including heat exchangers, hydraulic circuits and thermal metering at the boundary.

The 10/15/20% reuse targets are **not universal EU thresholds**. They are German EnEfG Section 11 targets for data centres entering operation from 1 July 2026, 1 July 2027 and 1 July 2028 respectively, subject to the statute's scope and exceptions. They must be implemented as effective-dated German policy rules.

## 5. Multi-tenant and CSRD/ESRS support

Tenant partial PUE is an allocated operational metric, not a substitute for the facility-wide regulated PUE. Every result identifies the reporting boundary, tenant, direct meters, shared pools, allocation method, rule version, estimated coverage and reconciliation variance.

CSRD and ESRS applicability and transition dates can change by entity and reporting year. The platform must produce traceable energy and greenhouse-gas evidence, including location- and market-based Scope 2 data where supported, but must describe outputs as `CSRD/ESRS support`. It must not claim that a tenant export is itself a compliant sustainability statement or assurance opinion.

## 6. Source register

- [Directive (EU) 2023/1791 on energy efficiency](https://eur-lex.europa.eu/eli/dir/2023/1791/oj)
- [Delegated Regulation (EU) 2024/1364](https://eur-lex.europa.eu/eli/reg_del/2024/1364/oj)
- [European Commission: energy performance of data centres](https://energy.ec.europa.eu/topics/energy-efficiency/energy-efficiency-targets-directive-and-rules/energy-efficiency-directive/energy-performance-data-centres_en)
- [Commission rating-scheme package, adopted 21 September 2026](https://energy.ec.europa.eu/publications/commission-delegated-regulation-establishing-common-union-rating-scheme-data-centres-and-annexes_en)
- [Commission Recommendation (EU) 2024/2395 on EED Article 26](https://eur-lex.europa.eu/eli/reco/2024/2395/oj)
- [German Energy Efficiency Act (EnEfG), Section 11](https://www.gesetze-im-internet.de/enefg/__11.html)
- [European Commission: corporate sustainability reporting](https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en)

## 7. Change control

A regulatory update creates a new rule-set version and a migration assessment. It does not recalculate locked periods automatically. Promotion to production requires legal review, product approval, test vectors, release notes, an effective date, and rollback capability. Monitoring must cover EU Official Journal publication, European Commission data-centre guidance, Member State implementations, CSRD/ESRS changes, and supported national regimes.
