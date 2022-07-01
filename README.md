# Akenza Device Type Library

Welcome to the Akenza Device Type Library. <br>
This is a collection of all integrated decoders for akenza.io.<br>
Feel free to use them and submit your own decoders.<br>

## Devlopment

- Clone the repository
- Install dependencies with `npm install`.
- Create your device type more _here_
- Test your device type step by step with the uplink.spec.js or with the command `npm test`

## How to structure your device type

- Use topics to structure similar data (i.e. ambiance, occupancy, lifecycle)
- Use a separate topic for shared data keys (e.g. battery or temperature if sent with all messages), this will allow you to properly query and aggregate this data
- Add titles and units for showing more metadata in Akenza

## Creating a device type

- Have the payload documentation ready
- If you need some inspiration, copy an already existing one f.e `./types/comtac/CM-1`
- If you already got a javascript decoder, you could integrate it like f.e `./types/digitalMatter/oyster`
- Pleas try to work inside the guidelines of eslint

## Helper function usage

The Bits and Hex library have some useful functions, integrate these into your device type to save time.

```javascript
// Gives back either a signed or unsigned little endian
let littleEndian = Hex.hexLittleEndianToBigEndian(hex, signed);

// Gives back an array of bytes, mostly used for easy TTN Decoder adoption
let byteArray = Hex.hexToBytes(payloadHex);

// Gives back the bits of the hexadecimal
let bits = Bits.hexToBits(payloadHex);

// Gives back the unsigned integer of the bits
var unsignedValue = Bits.bitsToUnsigned(bits);

// Gives back the signed number of the bits
var signedValue = Bits.bitsToSigned(bits);
```

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

## Open points

- Schema per topic in one file, use keywords? You can add additional metadata but it is not a good practice, further validators do not use it to validate data. Better use a base schema that is extended.
- Allow wildcard topic, to define that it is output to every topic
- Add downlink sample

## Links

- https://github.com/ajv-validator/ajv
