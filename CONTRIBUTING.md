# Contribution Guidelines

Thanks for helping to grow the akenza device type library! To add, remove or change a device type, submit a pull request.

Please only contribute types you have used before or are familiar with. This helps to keep the quality of the library high.

## Device type requirements

Each device type lives in its own folder `types/<manufacturer>/<MODEL>/`.

| File                   | Required            | Purpose                                                     |
| ---------------------- | ------------------- | ----------------------------------------------------------- |
| `meta.json`            | Yes                 | Metadata: name, manufacturer, sensors, topics, connectivity |
| `uplink.js`            | Yes                 | Uplink decoder implementing `function consume(event)`       |
| `uplink.spec.js`       | Yes                 | Mocha tests for the decoder                                 |
| `<topic>.schema.json`  | Yes (one per topic) | JSON Schema (draft-07) describing the data of each topic    |
| `downlink.js`          | No                  | Downlink encoder                                            |
| `downlink.schema.json` | No                  | Schema of the downlink payload                              |
| `<MODEL>.png`          | No                  | Picture of the device                                       |

- Encoder and decoder scripts must implement the akenza scripting interface. See the [scripting docs](https://docs.akenza.io/api-reference/advanced-topics/scripting).
- Reuse the shared measurement types in [`data-models/`](data-models) via `$ref` wherever a property matches one.
- A topic always contains all of its data keys. Emit `null` for unknown values instead of omitting them.
- More guidance on structuring a device type is in the [README](README.md).

## Development setup

Requires Node.js 20, 22 or 24 (the versions tested in CI).

```bash
npm install
cp .env.template .env
```

## Running tests

### Local tests

```bash
npm test
```

Runs every `*.spec.js` in `types/` and `lib/` in-process. This is what CI runs on every pull request.

To run the tests of a single device type:

```bash
npx mocha types/<manufacturer>/<MODEL>/uplink.spec.js
```

`TEST_MODE` controls how tests run. It is read from the shell first and from `.env` second:

| `TEST_MODE`   | Decoder runs                | `$ref` schemas loaded from |
| ------------- | --------------------------- | -------------------------- |
| `LOCAL`       | in-process                  | local `data-models/`       |
| `INTEGRATION` | on the akenza script runner | GitHub `main` branch       |

Keep `TEST_MODE="LOCAL"` in your `.env` (as in the template) so that `npm test` stays local.

### Integration tests

Integration tests send every decoder and test payload to the akenza script runner API and assert on what it returns. This catches differences between Node.js and the akenza runtime, for example the runtime timezone (UTC) or floating point results.

1. Set `SCRIPT_RUN_URL` and `API_KEY` in your `.env` (or export them in your shell):

   ```bash
   SCRIPT_RUN_URL="https://api.akenza.io/v3/run-script"
   API_KEY="<your akenza API key>"
   ```

2. Run all tests against the script runner:

   ```bash
   npm run integration-test
   ```

   To stop at the first failing test, or to run a single device type:

   ```bash
   TEST_MODE=INTEGRATION npx mocha --bail "types/**/*.spec.js" "lib/**/*.spec.js"
   TEST_MODE=INTEGRATION npx mocha types/<manufacturer>/<MODEL>/uplink.spec.js
   ```

Never commit `.env` or your API key.

Integration tests are not run in CI, so please run them for the device types you changed. When writing tests that hold up in both modes:

- Compare floating point values with `assert.closeTo` instead of `assert.equal`.
- Don't depend on the timezone of the machine. Build expected dates in UTC, e.g. `new Date("2026-02-03T15:15:00Z")`.

## Code style

Code is formatted with [Prettier](.prettierrc) (double quotes, 2-space indentation, trailing commas) and linted with [ESLint](eslint.config.mjs):

```bash
npx prettier --write types/<manufacturer>/<MODEL>
npx eslint types/<manufacturer>/<MODEL>
```

## Pull requests

- Add an entry to [`CHANGELOG.md`](CHANGELOG.md). This is enforced by a GitHub Action; maintainers can skip it with the `Skip-Changelog` label.
- Make sure `npm test` passes, and ideally the integration tests for the types you changed.
- Every PR must be approved by at least one [code owner](.github/CODEOWNERS). The code owners review your PR and tag it if information is missing. They wait 8 days for your response, after that the PR is closed.

## Reporting issues

Please open an issue if you would like to discuss improvements or have suggestions.
