# Akenza Device Type Library

Welcome to the akenza Device Type Library. <br>
This is a collection of all integrated decoders for akenza.io.<br>
Feel free to use them and submit your own decoders.<br>

## Overview

The data format of a device is defined by its device type (uplink decoder and downlink encoder). Once a device sends a data point the uplink decoder script of the device type will decode the raw data into a structured JSON format. Device types can either be created by akenza users (custom device type) or an akenza predefined device type can be used (akenza device type library). Alternatively, it is possible to synchronize a custom device type library, which will be available to all users of the akenza deployment.

In order to store multiple different message formats on a device, each data point is assigned to a topic (e.g. lifecycle information, configuration and measurements), which can then be used at query-time to retrieve data for a specific schema/purpose. It is advised to use one topic per payload type (i.e. always output data with the same structure to the same topic and try to prevent mixing data structures within the same topic). Generally, use different topics for data that is not sent in the same message.

Each device type defines a data schema per topic. The data schema definition is defined in JSON schema. The schema definition is used throughout the akenza appliction to display and control data. Data types, the value range and units are managed by the data schema and do not have to be stored for every data point. A set of default measurement types is defined in `data-models`, that can be used and extended throghout JSON schemas.

## Development

- Clone the repository
- Install dependencies with `npm install`.
- Create your device type
- Test your device type step by step with the uplink.spec.js or with the command `npm test`
- Create a .env file from the template to run your tests local

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

###

- a topic should always contain all data keys
- if a value is unknown, a null value should be output

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

- TODO: Add functionality for a type array to include null values in seeed senseCAPS210X series & Milesight TS301 - TS302
- Schema per topic in one file, use keywords? You can add additional metadata but it is not a good practice, further validators do not use it to validate data. Better use a base schema that is extended.
- Allow wildcard topic, to define that it is output to every topic
- Add downlink sample

## Links

- https://github.com/ajv-validator/ajv
