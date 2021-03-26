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
- do_1_lora
- do_2_lora
- do_1_error
- do_2_error
- do_1
- do_2
- manually
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
- Forward
- Backwards
- Gender
- FaceMask
- Dwelltime
- Average Waiting Time
- Queue Depth

-- Diverse Sensor Types
- Button
- Distance
- Vibration
- Water leak
- Anomaly
- Status
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
- averageTemperature
- temperaturePT100
- tempHistory0
- tempHistory1
- tempHistory2
- tempHistory3
- tempHistory4
- tempHistory5
- tempHistory6
- tempHistory7
- humHistory0
- humHistory1
- humHistory2
- humHistory3
- humHistory4
- humHistory5
- humHistory6
- soilMoistureAtDepth0
- soilMoistureAtDepth1
- soilMoistureAtDepth2
- soilMoistureAtDepth3
- soilMoistureAtDepth4
- soilMoistureAtDepth5
- soilMoistureAtDepth6
- soilMoistureAtDepth7
- soilTemperatureAtDepth0
- soilTemperatureAtDepth1
- soilTemperatureAtDepth2
- soilTemperatureAtDepth3
- soilTemperatureAtDepth4
- soilTemperatureAtDepth5
- soilTemperatureAtDepth6
- soilTemperatureAtDepth7
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

-- Diverse data keys
- waterleak
- distance
- anomalyLevel
- vibration

-- Button data keys
- btnNfirst
- btnEfirst
- btnSfirst
- btnWfirst
- btnNpressed
- btnEpressed
- btnSpressed
- btnWpressed
- buttonCount
- usedCharges
- activeButtonN
- activeButtonE
- activeButtonS
- activeButtonW
- buttonId
- enabledButtonsIds
- imageID
- key1
- key2
- key3
- key4

-- Sensorspecific and sensorinternal data keys
- statusPercent
- voltage
- debug
- deviceType
- msgtype
- version
- fwVersion
- protocolVersion
- payloadVersion
- deviceID
- snr
- appMainVersion
- appMinorVersion
- resetCause
- minTempThreshold
- maxTempThreshold
- minHumThreshold
- maxHumThreshold
- sendInterval
- tempMeasurementRate
- historyTrigger
- tempThreshold
- tempOffset
- brightness
- sensorTemperatureInternal
- xOrientationAngle
- yOrientationAngle
- compassHeading
- co2SensorStatus
- numberOfValidSamples
- irExternalTemperature
- irInternalTemperature
- joinStrat
- ambitiousFirstPress
- dutyCycle
- buzzer
- confirmed
- statusMessageinterval
- appMode
- hex
- reboot
- recalibrateResponse
- vehicleCount
- dataType
- error
- historySeqNr
- prevHistSeqNr
- learningPerc
- learningFrom
- nrAlarms
- operatingTime
- repID
- maxAmplitude
- peakFrequency
- min0_10
- min10_20
- min20_40
- min40_60
- min60_80
- min80_100
- anomalyLvL20Hours
- anomalyLvL50Hours
- anomalyLvL80Hours
- anomalyLvL20Days
- anomalyLvL50Days
- anomalyLvL80Days
- anomalyLvL20Months
- anomalyLvL50Months
- anomalyLvL80Months


-- Flag data keys
- booster
- minTempOn
- maxTempOn
- minPt100On
- maxPt100On
- tempPt100
- tempI2C
- lastTempValid
- minHumOn
- maxHumOn
- minLemOn
- maxLemOn
- txOnEvent
- txOnTimer
- buttonEvent
- digitalInputEvent
- deepSleepEvent
- digitalInputState
- acc
- extMEM
- batLow
- async
- history
- alarming
- button
- configRX
- infoReq
- hbIRQ
- accIRQ
- highAlarm
- lowAlarm
- doorAlarm
- tamperAlarm
- floodAlarm
- foilAlarm
- userSwitchAlarm
- closeProximityAlarm
- disinfectAlarm
- mode

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
