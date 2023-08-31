# Changelog

All notable changes to this project will be documented in this file.

---

# [1.37.2] - 2023-08-30

### Added

- Added processingType

### Changed

- Renamed min/max to minimum/maximum

# [1.37.1] - 2023-06-28

### Changed

- Added filllevel compability to all distance sensors

# [1.37.0] - 2023-06-21

### Added

- Seed - SenseCAPT1000A

# [1.36.0] - 2023-06-20

### Added

- Dragino - NDDS20
- Dragino - NDDS75
- Dragino - NSE01

### Changed

- Added new type NBIOT

# [1.35.0] - 2023-06-13

### Added

- Milesight - UC300
- Milesight - EM300-DI
- Milesight - AT101
- Milesight - WS201

# [1.34.1] - 2023-05-28

### Changed

- Added new button topic for the Swisscom Multisense device

# [1.34.0] - 2023-04-03

### Added

- Milesight - EM400-MUD
- Milesight - EM400-TLD
- Milesight - EM400-ULD

### Changed

- Added configuration message to all elsys devices
- Caught to short payload for Abeeway
- Removed inclusion of timestamp for enginko devicses
- Dragino LSN50v2 splitted topics and added test

# [1.33.0] - 2023-03-27

### Added

- Dragino - CPL01
- Dragino - LDDS04
- Dragino - LDDS20
- Dragino - LDDS45
- Dragino - LDDS75
- Dragino - LDS02
- Dragino - LDS03A
- Dragino - LHT52
- Dragino - LHT65
- Dragino - LHT65N
- Dragino - LHT65N-NE117
- Dragino - LLDS12
- Dragino - LLMS01
- Dragino - LSE01
- Dragino - LSN50V2-D20
- Dragino - LSN50V2-D22
- Dragino - LSN50V2-D23
- Dragino - LSN50V2-S31
- Dragino - LSN50V2-S31B
- Dragino - LSPH01
- Dragino - LTC2
- Dragino - LWL02

### Changed

- CM-2 - Updated with new datapoints
- Sentinum - Added Batterylevel
- PepepperLuchs - Took out invalid datapoints
- Ranos DB - Added fix from devs
- IMBuilding Peoplecounter - Added NBIoT functionality

# [1.32.1] - 2023-03-07

### Changed

- Fixed some critical and high vulnerabilities for npm packages

# [1.32.0] - 2023-02-27

### Added

- Milesight - VS132
- Cayenne

### Changed

- Added required for keys in schema files
- Renamed image files to be more standardised
- Renamed voltage to batteryVoltage to standardise keys
- Standardised accceleration/gyro keys

# [1.31.0] - 2023-02-20

### Added

- Sentinum - Apollon Q
- Sentinum - Apollon Zeta
- Sentinum - Febris CO2
- Sentinum - Febris SCW
- Sentinum - Febris TH

# [1.30.6] - 2023-01-25

### Changed

- Xovis - Added timestamp in emit

# [1.30.5] - 2023-01-23

### Changed

- Mclimate - Vicki

# [1.30.4] - 2023-01-17

### Changed

- Xovis - Added more outputs to count

# [1.30.3] - 2023-01-03

### Changed

- RanosDB - Changed uplink to match new firmware and added batteryLevel

# [1.30.2] - 2022-12-20

### Changed

- Added check for name length in meta

# [1.30.1] - 2022-12-15

### Changed

- Xovis PC2SV5 - Summating logic samples into one

# [1.30.0] - 2022-12-09

### Added

- Milesight - AM103
- Milesight - AM307
- Milesight - AM308
- Milesight - AM319
- Milesight - EM300-MCS
- Milesight - EM300-SLD
- Milesight - EM310-TILT
- Milesight - EM310-UDL
- Milesight - EM320-TH
- Milesight - EM320-TILT
- Milesight - EM500-LGT
- Milesight - EM500PP
- Milesight - EM500-PT100
- Milesight - EM500-SMTC
- Milesight - EM500-UDL
- Milesight - WS50X
- Milesight - WS50X2
- Milesight - WS52X
- Milesight - WS136
- Milesight - WS156
- Milesight - WS302

# [1.29.0] - 2022-12-06

### Changed

- Added check for misspelled/missing keys in schema files
- Added check for missing topics in meta files
- Fixed those occurrences

# [1.28.0] - 2022-11-29

### Added

- Ascoel - PB868LR
- Seeed - SenseCAP S2101
- Seeed - SenseCAP S2102
- Seeed - SenseCAP S2103
- Seeed - SenseCAP S2104
- Seeed - SenseCAP S2105
- Seeed - SenseCAP A1101

# [1.27.1] - 2022-11-07

### Changed

- Decentlab - PR26 - Added water level as output, updated test

# [1.27.0] - 2022-11-04

### Added

- HKT - Door sensor
- HKT - People counter
- Terabee - Peoplecounting M
- Terabee - Peoplecounting XL
- Adeunis - Dry Contac
- DigitalMatter - oyster3
- Elsys - elt2ultrasonic
- Ewatch - squid hc lorawan
- Mclimate - vicki

### Changed

- Iotracker - Changed meta
- Disruptive Technologies - Added sqi values

# [1.27.0] - 2022-11-03

### Added

- Comtac - Cluey

### Changed

- Xovis - added mod payloads

# [1.26.0] - 2022-10-28

### Added

- Elsys - ers eco
- Elsys - ers eco co2

# [1.25.0] - 2022-10-21

### Added

- Seeed - S2101
- Seeed - S2102
- Disruptive - CO2
- Disruptive - Motion

# [1.24.0] - 2022-09-21

### Added

- ioTracker - ioTracker3

# [1.23.3] - 2022-09-20

### Added

- Enginko - EGK-LW20W00

### Changed

- Adnexo - updated meta
- Xovis - Added plugin data output

# [1.23.2] - 2022-09-08

### Changed

- Enginko - Sensor now sends all samples and emits on defined timestamps
- Changed battery calculations so no negative numbers will be given out anymore

# [1.23.1] - 2022-09-07

### Changed

- Haltian - Changed uplinks so no unknown messages get pushed & Changed topic weather to environment

# [1.23.0] - 2022-08-21

### Added

- Sensing Labs - Senlab D

# [1.22.1] - 2022-08-05

### Added

- Hidden a lot of cluttering kpis

# [1.22.0] - 2022-08-02

### Added

- Adnexo - Ax-dist

### Changed

- Adnexo - Ax-opto changed shemas to mach ax-dist
- Miromico - REV2_V5 changed key names to mach standards
- Updated some meta information
- Changed some sensor images

# [1.21.0] - 2022-07-13

### Added

- Haltian - Thingsee Air
- Haltian - Thingsee Environment
- Haltian - Thingsee Presence

# [1.20.2] - 2022-07-07

### Added

- Decentlab - IAM - lifecycle hide protocolVersion from KPI's

# [1.20.1] - 2022-07-06

### Changed

- Cleaned up readme
- Using the new helper functions

# [1.20.0] - 2022-07-05

### Added

- Adnexo - Ax-opto
- Dragino - LHT65
- Terabee - Level Monitoring XL

# [1.19.0] - 2022-06-30

### Added

- Digitalmatter - Bolt 2-4G
- Digitalmatter - Dart 3
- Digitalmatter - SensorNode
- Digitalmatter - Yabby

# [1.18.3] - 2022-06-20

### Added

- pepperlFuchs - wilsenSonicLevel

# [1.18.2] - 2022-05-31

### Changed

Cleanup and fixes of the below device types

- Adeunis - Pulse
- Talkpool - OY1110
- Tektelic - Smart Room Base
- Tektelic - Smart Room PIR

# [1.18.1] - 2022-05-30

### Changed

- Strip - Presence uplink
- Busylight- Image

# [1.18.0] - 2022-05-24

### Added

- MClimate - Button
- MClimate - CO2
- MClimate - Flood Sensor
- MClimate - HT
- Talkpool - OY1110
- IMBuildings - Moodbox

# [1.17.0] - 2022-04-26

### Added

- Tektelic - Smart room base
- Tektelic - Smart room PIR
- Bosch - Parking lot sensor V0.39

# [1.16.1] - 2022-03-30

### Changed

- Milesight - Ignoring empty payloads
- Akenza - Device simulator
- Yanzi - Took out occupancy & updated noise schema

# [1.16.0] - 2022-03-22

### Added

- Milesight - AM319
- Milesight - EM300-ZLD
- Milesight - VS121
- Milesight - WS101
- Milesight - WS202
- Milesight - WS301

# [1.15.0] - 2022-03-15

### Removed

- Swisscom - Multisense depricated devicetypes

### Changed

- Abeeway - Trackers new topic for gps failed
- Abeeway - Trackers changed meta
- IMBuildings - Counters changed meta

# [1.14.0] - 2022-03-11

### Added

- Xovis - PC2SV5

# [1.13.0] - 2022-03-03

### Added

- Abeeway - Badge tracker
- Abeeway - Compact tracker
- Abeeway - Micro tracker
- IMBuidlings - Comfort sensor
- IMBuidlings - Office occupancy counter
- IMBuidlings - People counter

# [1.12.2] - 2022-03-02

### Changed

- Adeunis - FTD Network Tester Added batteryLevel
- Sensative - small uplink change
- Swisscom - Multisense small schema change
- Yanzi - Ignoring not documented payloads
- Universal - Fire Extinguisher changed meta

# [1.12.1] - 2022-02-10

### Changed

- Comtac - CM-1 & CM-2 Added batteryLevel
- Elsys - ELT changed schema
- Elsys - CO2 added motion
- Miromico - miro Click deleted unused schema & fixed typo
- Oxon - Oxobutton changed schema
- Sensativ - Strip +Guard changed dataKey name
- Swisscom - Multisense fixed unit typo & rounded voltage
- nke Watteco - BoB assistant changed meta and renamed devicetype

# [1.12.0] - 2022-02-04

### Added

- Yanzi - Comfort
- Yanzi - Motion+
- Yanzi - Presence Mini
- Yanzi - Plug

# [1.11.1] - 2022-01-28

### Changed

- Comtac - CM1 changed schema
- Elsys - ELT-2 changed schema
- Swisscom - Multisense updated meta topics
- Watecco - BoB updated meta

# [1.11.0] - 2022-01-25

### Added

- Elsys - ERS VOC

# [1.10.0] - 2022-01-21

### Added

- Adeunis - Pulse
- Digitalmatter - G62

# [1.9.3] - 2022-01-20

### Changed

- Browan - Changed battery calculation
- Comtac - CM-2 added datapoint to schema
- Elsys - Changed battery calculation
- Elsys - ELT-2 changed meta
- Pipiot - Changed meta

# [1.9.2] - 2022-01-06

### Changed

- Pipiot - Changed meta

# [1.9.1] - 2022-01-11

### Changed

- Browan - Changed name from "Motion Sensor PIR, TBDMS100" -> "Motion Sensor PIR, TBMS100"
- Miromico - Changed name from "Insight" -> "miro Insight"
- Browan - TBSound updated schema & deleted unused data
- Elsys - ERS Sound changed meta
- Miromico - REV 2_5 deleted unused data
- PNI - Placepod changed temperature to signed
- Sensative - Strips changed name of datakey

# [1.9.0] - 2022-01-04

### Added

- Pipiot - LevelSense
- Pipiot - PeopleSense

# [1.8.1] - 2022-01-03

### Changed

- Decentlab IAM - Added batteryVoltage
- Elsys ERS - Deleted motion
- PNIcorp Placepod - Changed meta
- Talkpool OY1700 - Splited schemas

# [1.8.0] - 2021-12-16

### Added

- Browan - TBDMS100

# [1.7.2] - 2021-12-16

### Changed

- Comtact CM-3 - Fixed a bug where wrong topics got emited and added testscript

# [1.7.1] - 2021-12-08

### Changed

- Elsys Door - Added topics in meta to match new output
- Miromico insight - Version & picture
- Sensative - Strip MS-Guard Presence description & availableSensors
- Sensative - Strip Presence availableSensors

# [1.7.0] - 2021-12-02

### Changed

- Bosch - parkingLotSensor Changed string output to ENUM
- Elsys - Added Battery in percent for all sensors which give out voltage
- Elsys - EMS Door spliced schemas so we dont have double KPI for the same value
- Globalsat - LS-113G deleted unused keys
- Oxon - Buttonboard deleted unused key
- PNI - PlacePod changed some data outputs to enum instead of string
- Talkpool - oy1200 changed some data outputs to enum instead of string
- Talkpool - oy1700 changed some data outputs to enum instead of string

### Breaking changes

- Miromico - miro Click V2.5.0 changed name to miro Click and changed Versions
- Miromico - miro Click V2.0.0 deleted old devicetype in response to manufacturer
- Swisscom - Multisense unified all devicetypes to one and named the old ones to deprecated

# [1.6.0] - 2021-11-15

### Added

- Miromico - Insight

# [1.5.1] - 2021-11-15

### Changed

- Sensative - Strip MS-Guard Presence description
- Sensative - Strip Presence description

# [1.5.0] - 2021-10-26

### Added

- Sensative - Strip Presence

### Changed

- Changed folder name for sensative

# [1.4.3] - 2021-10-21

### Changed

- Updated tests to match the new guidelines
- Changed Kuando Busylight name!
- Changed description of ranosDB2

# [1.4.3] - 2021-10-20

### Added

- Added functionality to run tests in integration mode

# [1.4.2] - 2021-10-19

### Changed

- Oxon - Buttonboard changed from button ID to individual button outputs.

# [1.4.1] - 2021-10-18

### Changed

- Added titles/units to schemas

# [1.4.0] - 2021-10-13

### Added

- DSS - Ranos DB 2

# [1.3.2] - 2021-10-12

### Changed

- Disruptive Technologies - Fix event type extraction

# [1.3.1] - 2021-10-11

### Changed

- Disruptive Technologies - Changed images
- Decentlab LP8P - Changed metatext and renamed datakeys

## [1.3.0] - 2021-10-07

### Added

- Plenom - Kuando busylight

## [1.2.0] - 2021-10-07

### Added

- Decentlab - LP8P

# [1.1.6] - 2021-10-07

### Changed

- Distuptive technologies - adapt event payload

# [1.1.5] - 2021-10-06

### Changed

- Adeunis - ftdNetworkTester

### Deleted

- Adeunis - ftdNetworkTesterV2

# [1.1.4] - 2021-10-04

### Changed

- Enginko - MCF-LW12CO2E removed unused schemas and changed meta accordingly
- Xovis PC2S - Updated uplink so it's working with akenza.io & added tests

## [1.1.3] - 2021-09-30

### Added

- Adeunis - ftdNetworkTesterV2

## [1.1.2] - 2021-09-29

### Changed

- Adeunis - ftdNetworkTester added default schema & uplink test

## [1.1.0] - 2021-09-20

### Added

- Milesight - AM104
- Milesight - AM107
- Milesight - EM300-TH
- Milesight - EM500-CO2

# [1.0.18] - 2021-09-17

### Changed

- Enginko - MCF-LW12CO2E cleaned up the uplink

## [1.0.17] - 2021-09-15

### Changed

- New images for Disruptive Technologies Sensors

## [1.0.16] - 2021-09-15

### Added

- Disruptive Technologies - Humidity Sensor
- Disruptive Technologies - Proximity Sensor
- Disruptive Technologies - Temperature Sensor
- Disruptive Technologies - Touch Sensor
- Disruptive Technologies - Water Sensor

## [1.0.15] - 2021-08-18

### Added

- Enginko - MCF-LW12CO2E

## [1.0.14] - 2021-08-10

### Added

- Astraled - CO2, VOC luminaire V0.03

### Fixed

- Schemas of all astraled sensors changed so all possible datapoints are shown

## [1.0.13] - 2021-07-20

### Fixed

- Several name and description improvements

## [1.0.12] - 2021-07-20

### Fixed

- Comtac - CM 1 uplink

## [1.0.11] - 2021-07-12

### Added

- Gavazzi - UWPA/UWPM

## [1.0.10] - 2021-07-06

### Changed

- Deprecates the usage of `payload_hex` => use `payloadHex` instead

## [1.0.9] - 2021-06-22

### Added

- Landis+Gyr - ULTRAHEAT T550

## [1.0.8] - 2021-06-21

### Added

- GWF - RCM®-LRW10

## [1.0.7] - 2021-06-08

### Added

- AstraLED - Mantis
- Aiut - alevel V1
- Aiut - alevel V2

## [1.0.6] - 2021-06-04

### Added

- Tinovi - PM-IO-5-SM

## [1.0.5] - 2021-06-01

### Added

- Comtac - CM-4

## [1.0.4] - 2021-05-20

### Added

- Dragino - LSE01

## [1.0.3] - 2021-05-19

### Added

- Digitalmatter - Oyster

## [1.0.2] - 2021-05-10

### Fixed

- Adds `eslint` to improve code style

## [1.0.1] - 2021-05-07

### Fixed

- Fixes an issue where little endian conversion for GlobalSat LT-20 was wrong

## [1.0.0]

### Added

- Adeunis - FTD Network tester
- Akenza - Device Simulator
- AstraLED - CO2, VOC luminaire
- Avelon - Wisely CarbonSense
- Bosch - Parking Lot Sensor
- Browan - Temperature & Humidity Sensor, TBHH100, Tabs
- Browan - Door & Window Sensor, TBDW100 Tabs
- Browan - Sound Level Sensor, TBSL100, Tabs
- Browan - Water Leak Sensor, TBWL100, Tabs
- Comtac - LPN CM-1 Sensor
- Comtac - LPN CM-2 Sensor
- Comtac - LPN CM-3 Sensor
- Comtac - LPN DO
- Comtac - LPN Multi-Sensor 3
- Decentlab - DL-ATM41
- Decentlab - DL-IAM
- Decentlab - DL-MBX
- Decentlab - DL-PR21
- Decentlab - DL-PR26
- Decentlab - DL-PR36
- Decentlab - DL-SHT35
- Decentlab - DL-SMTP
- Elsys - ELT-2
- Elsys - ELT Lite
- Elsys - EMS Desk
- Elsys - EMS Door
- Elsys - EMS Lite
- Elsys - EMS
- Elsys - ERS CO2 Lite
- Elsys - ERS CO2
- Elsys - ERS Desk
- Elsys - ERS Eye
- Elsys - ERS Lite
- Elsys - ERS Sound
- Elsys - ERS
- GlobalSat - LS-113G
- GlobalSat - LT-20/LT-20P
- Miromico - FMLR IoT Button V2.5.0
- Miromico - FMLR IoT Button V2.0.0
- Netvox - R312A - Wireless Emergency Button
- Netvox - Door R311A-Wireless Door/Window Sensor (LoRaWAN)
- Netvox - R711-Wireless Temperature and Humidity Sensor
- Oxon - Buttonboard (LoRaWAN)
- Oxon - Oxobutton Q, (LoRaWAN)
- PNI - PlacePod (Surface & In-Ground Mount)
- RAK - 612 WisNode Button
- Sensative - All Strips (LoRaWAN)
- Swisscom - Multisense - Ambiance
- Swisscom - Multisense - Button
- Swisscom - Multisense - Door
- Swisscom - Multisense - General
- Swisscom - Multisense - Vibration
- Swisscom - Multisense - Workplace
- Synetica - Enlink DP
- Synetica - Enlink T
- Talkpool - OY1210 CO2 meter
- Talkpool - OY1700 Particles meter
- Universal - Fire Extinguisher
- nke Watecco - BOB Assistant
- Xovis - PC2S
