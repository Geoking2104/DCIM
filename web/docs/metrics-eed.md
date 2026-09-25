# Indicateurs EED — PUE, WUE, CUE, facteur d’émission

Preview interne (`official=false`). Pas un label / QR UE.

## PUE

PUE = E_site / E_IT  (même période, ISO/IEC 30134-2).

## WUE

WUE = V_eau (L) / E_IT (kWh)  → L/kWh IT.
Compteurs process uniquement (tours, appoint froid, humidification).

## CUE

CUE = E_CO2 (kgCO2e) / E_IT (kWh).
E_CO2 = somme (E_source_i × f_i).
Si mix unique : CUE ≈ PUE × f.

## Facteur d’émission f

f = kgCO2e / kWh livré.
- Réseau : location-based (mix local / horaire RTE) ou market-based (contrat / GO contemporaines).
- Groupes : kgCO2e carburant / kWh électriques produits.
- Chaleur urbaine : contenu CO2 du réseau.
Référentiel unique (combustion vs ACV) pour toutes les sources.
