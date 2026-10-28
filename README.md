# WorldCup Testnet — Every Nation. Every Match.

> **TESTNET repo** (Pi sandbox). Its own Cloudflare project with the **testnet** app's `PI_API_KEY`. Never point the mainnet project here.

App name: **WorldCup** · Domain: **worldcup.pi** · Cloudflare Pages: **worldcup-app.pages.dev** · Support: support.worldcup@gmail.com

The home of international football on Pi Network: national teams (Nations), World Cup brackets, World Cup
history and the 2030 countdown, live scores, fixtures, tables, Pi sign-in and Pi support payments.
Club football is included lower down so there are matches all year.

Separate app with its own repos and Cloudflare projects (testnet: `Worldcup-testnet`). Never combine with SPL, Copa or CopaAmerica.

## Cloudflare settings (Settings → Variables and Secrets)
| Name | What |
|---|---|
| `PI_API_KEY` (secret) | From develop.pi (this app) |
| `PI_VALIDATION_KEY` (optional) | Domain validation key, if not using `validation-key.txt` |
| `FD_API_KEY` (secret) | football-data.org key (World Cup, Euro, club leagues) |
| `API_FOOTBALL_KEY` (secret, optional) | Friendlies, Nations League, qualifiers (paid plan for current seasons); `AF_LEAGUES` default `10,5` |

**Bindings → KV namespace:** variable name `WC_CACHE`. Then open **`/launch-check`**: every row should be green.

## Local test
`MOCK=hy node test/serve.mjs 8789` then open http://localhost:8789 (mock data, fake Pi).
