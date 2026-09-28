# Qinode 3D thermal engines

Static WebGL prototypes served from `public/twin`.

| File | Description |
| --- | --- |
| `thermal-hvac.html` | Heatmap + HVAC flux + laya-onnx assistant |
| `thermal-flux.html` | HVAC / hydronic flux engine (no AI panel) |

App route: `/[locale]/jumeau` embeds `thermal-hvac.html`.

These pages are demos. They do not read ClickHouse or GraphQL yet.
