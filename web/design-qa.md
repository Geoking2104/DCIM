# Thermal visualisation design QA

- Source visual truth: `C:\Users\geoff\Downloads\3d_data_center_thermal_heatmap_ai_engine.html`
- Source capture: `design-evidence/reference-thermal-1440x900.png`
- Implementation capture: `design-evidence/implementation-thermal-1440x900.png`
- Viewport: 1440 × 900 CSS px, device scale factor 1
- State: default simulation, all layers enabled, no incident selected

## Comparison

The integrated route preserves the reference hierarchy: Qinode header, four KPI cards, left HVAC and thermal-layer controls, central Three.js scene, right AI/incident panels, rack inspector, and bottom thermal legend. The implementation uses the existing product shell and Phosphor icons while re-creating the reference scene with application-owned Three.js geometry.

The first local capture exposed a timing/host issue where WebGL was blank when loaded from `127.0.0.1` against the Next development host. The route was rechecked on `localhost`, the camera framing was adjusted, and the final capture shows the scene, racks, pipes, heat volumes, and particles correctly.

## Final checks

- Typography: product font stack is retained; monospace values and uppercase labels match the reference tone.
- Layout and spacing: desktop panels, KPI row, scene canvas, inspector, and mobile collapse controls are aligned to the reference proportions.
- Colors and tokens: dark navy shell, cyan/teal cold flow, amber/red hot flow, and violet AI accents are preserved.
- Copy and content: synthetic content is explicitly labelled `SIMULATION`, `scenario twin`, or `deterministic policy preview`; no live-data claim is made.
- Responsive behavior: side panels collapse to mobile controls below the desktop breakpoint.
- Interactions: rack selection, hotspot injection, layer toggles, flow controls, workload rebalance, reset view, and incident resolution were exercised through the browser protocol.
- Browser errors: none in the final interaction pass.

## Findings

- P3: font rendering may vary slightly from the CDN reference because the integrated route uses the repository's existing font stack.
- P3: the Three.js scene is a productized reimplementation rather than byte-for-byte source geometry, while preserving the visual intent and operational controls.

final result: passed
