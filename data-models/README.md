# Data models

Common Akenza data models that are used throughout the device types.

Data models are referenced by using the id and relevant definition:

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
      "$ref": "https://akenza.github.io/device-types-library/data-models/ambiance/climate/schema.json#/$defs/temperatureC"
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
