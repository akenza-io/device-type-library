# Changelog

All notable changes to this project will be documented in this file.

---

# [1.7.0] - 2021-11-25

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
- Swisscom - Multisense unified all devicetypes to one

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
