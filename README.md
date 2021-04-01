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

-- Environmental Sensor Types
- Temperature
- Precipitation
- Soil moisture
- Soil temperature
- Barometric Pressure
- Vapor Pressure
- Noise
- Light
- Solar radiation
- Lightning strike detector
- Wind speed
- Wind direction


-- Air quality Sensor Types
- Humidity
- CO2
- eCO2
- CO
- VOC
- PM1.0
- PM2.5
- PM4.0
- PM10

-- Electricity Sensor Types
- Energy
- LEM
- External Analog Input
- Light State

-- Magnetic & infrared Sensor Types
- Reed
- Occupancy
- Motion
- PIR

-- Acceleration Sensor Types
- Acceleration
- Gyro
- Magnetometer

-- GPS Sensor Types
- Latitude
- Longitude
- Altitude

-- People Counting Sensor Types
- Forward Count
- Backwards Count
- Gender
- FaceMask
- Dwelltime
- Average Waiting Time
- Queue Depth

-- Other Sensor Types
- Button
- Distance
- Vibration
- Water leak
- Image


## Available data keys

The following available data keys should be used.

-- Environmental data keys
- light
- solarRadiation
- precipitation
- lightningStrikeCount
- lightningAverageDistance
- windSpeed
- windDirection
- maximumWindSpeed
- northWindSpeed
- eastWindSpeed
- temperature
- pressure
- vaporPressure
- atmosphericPressure
- soundAvg

-- Air quality data keys
- humidity
- voc
- co
- co2
- eco2
- pm1_0
- pm2_5
- pm4_0
- pm10

-- Electricity data keys
- light_state
- adc1
- adc2
- lem
- energy

-- Magnetic & infrared data keys
- occupancy
- motion
- open
- pir
- rawPir
- reedCounter

-- Acceleration data keys
- accX
- accY
- accZ
- gyroX
- gyroY
- gyroZ
- magnX
- magnY
- magnZ

-- GPS data keys
- latitude
- longitude
- altitude

-- People Counting data keys
- fw
- bw
- count
- faceMask
- gender
- queueDepth
- avgWaitingTime
- dwelltime
- maleFw
- femaleFw
- maleBw
- femaleBw
- maleFwPercentage
- femaleFwPercentage
- maleBwPercentage
- femaleBwPercentage

-- Other data keys
- waterleak
- distance
- anomalyLevel
- vibration

-- Button data keys
- buttonId
- imageID

-- Sensorinternal data keys
- statusPercent
- voltage
- debug
- fwVersion

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
