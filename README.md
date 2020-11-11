# Akenza Device Type Library

By default data is expected to be published on the default topic, the schema `schema.json` or `default.schema.json` specifies this. For a non-default topic use `<topic>.schema.json`.

## Devlopment

Install dependencies `npm install`.

## Open points

- Schema per topic in one file, use keywords? You can add additional metadata but it is not a good practice, further validators do not use it to validate data. Better use a base schema that is extended.
- Allow wildcard topic, to define that it is output to every topic
- Add downlink sample

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
- 

## Links

- https://github.com/ajv-validator/ajv