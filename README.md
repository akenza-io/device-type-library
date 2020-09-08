# Akenza Device Type Library

By default data is expected to be published on the default topic, the schema `schema.json` or `default.schema.json` specifies this. For a non-default topic use `<topic>.schema.json`.

## Open points

- Schema per topic in one file, use keywords? You can add additional metadata but it is not a good practice, further validators do not use it to validate data. Better use a base schema that is extended.
- Allow wildcard topic, to define that it is output to every topic
- Add downlink sample


## Links

- https://github.com/ajv-validator/ajv