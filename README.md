# Akenza Device Type Library

Welcome to the akenza Device Type Library. <br>
This is a collection of all integrated decoders for akenza.io.<br>
Feel free to use them and submit your own decoders.<br>

## Development

- Clone the repository
- Install dependencies with `npm install`.
- Create your device type
- Test your device type step by step with the uplink.spec.js or with the command `npm test`

## How to structure your device type

- Create an uplink decoder file, more to that in the next section
- Create a schema for each topic and an entry for each key in the topic
- Use topics to structure similar data (i.e. ambiance, occupancy, lifecycle)
- Use a separate topic for shared data keys (e.g. battery or temperature if sent with all messages), this will allow you to properly query and aggregate this data
- Add a processingType of `uplink_decoder` or `downlink_encoder` depending on the use of the schema
- Add titles and units for showing more metadata in akenza
- If preferred, you could create a downlink encoder to make it easier for the user to structure downlinks
- Be sure to add an image of the sensor
- Add a metadata file with basic information

## Creating a uplink decoder

- Have the payload documentation ready
- If you need some inspiration, copy an already existing one e.g. [./types/comtac/CM-1](https://github.com/akenza-io/device-type-library/blob/main/types/comtac/CM-1/uplink.js)
- If you already got a javascript decoder, you could integrate it like [./types/digitalMatter/oyster](https://github.com/akenza-io/device-type-library/blob/main/types/digitalMatter/oyster/uplink.js)
- Adhere wherever possible to the eslint rules

## Helper function usage

The Bits and Hex library have some useful functions, integrate these into your device type to save time.
You can find those explained in our [Documentation](https://docs.akenza.io/api-reference/scripting/utility-functions#bits-to-unsigned-integer).

## Use preexisting types

Common data types can be reused by combining schemas.

```json
{
  "$id": "https://akenza.io/<manufacturer>/<model>/default.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "<Model> schema",
  "type": "object",
  "allOf": [
    {
      "$ref": "https://raw.githubusercontent.com/akenza-io/device-type-library/main/data-models/ambiance/temperature/schema.json"
    },
    {
      "$ref": "https://raw.githubusercontent.com/akenza-io/device-type-library/main/data-models/common/battery/schema.json"
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

## Open points

- Schema per topic in one file, use keywords? You can add additional metadata but it is not a good practice, further validators do not use it to validate data. Better use a base schema that is extended.
- Allow wildcard topic, to define that it is output to every topic
- Add downlink sample

## Links

- https://github.com/ajv-validator/ajv
