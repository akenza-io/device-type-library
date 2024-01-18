# Default data-models

We provide common default Akenza data-models that can be used by either custom device-types or incorporated into device-types provided by our device-type library.

The default data-models can be used by referencing the `$id` and it's sub-path of the relevant schema-definition in the `$ref` of a new schema as illustrated below:

```
{
  "$id": "https://akenza.io/decentlab/iam/default.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "processingType": "uplink_decoder",
  "topic": "default",
  "title": "Default",
  "properties": {
    "temperature": {
      "$ref": "https://akenza.github.io/device-types-library/data-models/main/defaults/climate/schema.json#/$defs/temperature/celsius"
    },
    "humidity": {
      "title": "Humidity",
      "unit": "%",
      "type": "number",
      "description": "The relative humidity in %",
      "minimum": 0,
      "maximum": 100
    }
  },
  "required": [
    "temperature",
    "humidity"
  ]
}
```
