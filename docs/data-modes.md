# Live and demonstration data modes

The application defaults to **live mode**. Missing or unreachable operational data sources produce a structured `503 DATA_SOURCE_UNAVAILABLE` response and a visible unavailable state in the UI. The application must not silently replace operational data with simulated values.

Demonstration data requires both flags:

```dotenv
DCIM_DEMO_MODE=true
NEXT_PUBLIC_DCIM_DEMO_MODE=true
```

`DCIM_DEMO_MODE` controls server-side substitutes such as simulated ClickHouse series, local metric calculation, BMS samples, and in-memory alert/control journals. `NEXT_PUBLIC_DCIM_DEMO_MODE` allows client-side topology examples and displays a persistent warning banner. Set both to `false` or omit them in operational deployments.

Responses backed by ClickHouse include `X-DCIM-Data-Source: live`. Explicit demonstration responses use `X-DCIM-Data-Source: demo`; unavailable sources use `X-DCIM-Data-Source: unavailable`.

The public Vercel deployment is a product preview. Its project settings must explicitly define both variables as `true` and a new deployment must be created after changing them. Vercel project settings are preferred over committed `vercel.json` environment values.
