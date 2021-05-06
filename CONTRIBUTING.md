# Contribution Guidelines

- **To add, remove, or change device types in this library:** Submit a pull request.
- Every type must at least contain a meta file, an uplink decoder, a test for the decoder and a schema for each topic.
- Optionally, a type can have a picture, a downlink encoder as well as a downlink schema.
- Encoder and decoder scripts must implement the akenza scripting interface. You can find more info in the [docs](https://docs.akenza.io/api-reference/advanced-topics/scripting).

Please only contribute types you have used before or are familiar with. This will help ensure high-quality of the device type library.

## Code owners

To make sure every PR is checked, we have [code owners](.github/CODEOWNERS). Every PR MUST be reviewed by at least one code owner before it can get merged.

The code owners will review your PR and notify you and tag it in case any
information is still missing. They will wait 8 days for your interaction, after
that the PR will be closed.

## Reporting issues

Please open an issue if you would like to discuss anything that could be improved or have suggestions.

Thanks!
