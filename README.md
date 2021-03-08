# Akenza Device Type Library

By default data is expected to be published on the default topic, the schema `schema.json` or `default.schema.json` specifies this. For a non-default topic use `<topic>.schema.json`.

## Devlopment

Install dependencies `npm install`.

## Open points

- Schema per topic in one file, use keywords? You can add additional metadata but it is not a good practice, further validators do not use it to validate data. Better use a base schema that is extended.
- Allow wildcard topic, to define that it is output to every topic
- Add downlink sample

## How to structure your device type

- use topics to structure similar data (i.e. ambiance, occupancy, lifecycle)
- use a separate topic for shared data keys (e.g. battery or temperature if sent with all messages), this will allow you to properly query and aggregate this data
- add titles and units for showing more metadata in Akenza

## Available Sensor Types

The following available sensor types should be used.

- Occupancy
- Motion
- PIR
- Light
- Temperature
- Humidity
- CO2
- VOC
- Barometric Pressure
- Noise
- Battery Percent
- Battery Voltage

## Available data keys

The following available data keys should be used.

- Occupancy
- Motion
- PIR
- Light
- temperature
- Humidity
- CO2
- VOC
- Barometric Pressure
- Noise

## Use preexisting types

Common data types can be reused by combining schemas.

```
{
  "$id": "https://akenza.io/<manufacturer>/<model>/default.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "<Model> schema",
  "type": "object",
  "allOf": [
    {
      "$ref": "https://raw.githubusercontent.com/akenza-io/device-type-library/master/data-models/ambiance/temperature/schema.json"
    },
    {
      "$ref": "https://raw.githubusercontent.com/akenza-io/device-type-library/master/data-models/common/battery/schema.json"
    },
    {
      "properties": {
        "humidity": {
          "type": "number",
          "description": "The relative humidity in %.",
          "minimum": 0,
          "maximum": 100
        },
      ...
      }
    }
```

An example can be found in `./types/decentlab/IAM/default.schema.json`.

## Links

- https://github.com/ajv-validator/ajv
