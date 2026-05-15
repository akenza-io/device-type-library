# Default data-models

We provide common default Akenza data-models that can be used by either custom device-types or incorporated into device-types provided by our device-type library.

The default data-models can be used by referencing the `$id` and it's sub-path of the relevant schema-definition in the `$ref` of a new schema as illustrated below:

```
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://raw.githubusercontent.com/akenza-io/device-type-library/main/data-models/air-quality/schema.json",
    "title": "Air-Quality",
    "description": "Air-Quality measurements.",
    "type": "object",
    "$defs": {
        "co2": {
            "ppm": {
                "measurementType": "akenza/air-quality/co2/ppm",
                "title": "Carbon Dioxide (CO2)",
                "description": "Carbon Dioxide in ppm",
                "type": "integer",
                "unit": "ppm",
                "minimum": 0
            }
        },
        "tvoc": {
            "ppb": {
                "measurementType": "akenza/air-quality/tvoc/ppm",
                "title": "Total Volatile Organic Compounds (TVOC)",
                "description": "Total Volatile Organic Compunds in ppb",
                "type": "integer",
                "unit": "ppb",
                "minimum": 0
            }
        },
        "pm1": {
            "mcgm3": {
                "measurementType": "akenza/air-quality/pm1/mcgm3",
                "title": "Particulate Matter (PM1.0)",
                "description": "Particles with a diameter of less than 1.0 micrometers.",
                "type": "integer",
                "unit": "μg/m3",
                "minimum": 0
            }
        },
        "pm2_5": {
            "mcgm3": {
                "measurementType": "akenza/air-quality/pm2_5/mcgm3",
                "title": "Particulate Matter (PM2.5)",
                "description": "Particles with a diameter of less than 2.5 micrometers.",
                "type": "integer",
                "unit": "μg/m3",
                "minimum": 0
            }
        },
        "pm10": {
            "mcgm3": {
                "measurementType": "akenza/air-quality/pm10/mcgm3",
                "title": "Particulate Matter (PM10)",
                "description": "Particles with a diameter of less than 10 micrometers.",
                "type": "integer",
                "unit": "μg/m3",
                "minimum": 0
            }
        }
    }
}
```

## Measurement Type Id Structure

Measurement type ids are structured as follows:

```
akenza/<category>/<measurementType>/<unit>
```

for example

```
akenza/light/illuminance/lux
```

### Measurement Type Categories

- acoustics
- air-quality
- climate
- device
- geo-location
- light
- spaces
- speed

## Counter Types

The optional `"counterType"` field describes how a measurement value accumulates over time:

| Value           | Meaning                                                                                                                                                                  | Examples                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `"monotonic"`   | Strictly increasing; e.g. values that only reset on device power-cycle or replacement. The platform computes deltas and treats a value drop as a device reset.           | Energy (kWh), volume (m³), pulse counters, door counters |
| `"delta"`       | Increment since its last transmission, not the absolute total. Values represent a quantity over the reporting interval and can be summed to reconstruct a running total. | Consumption per interval, events since last uplink       |
| `"gauge"`       | Instantaneous numeric reading that can increase or decrease freely. This is the default when `counterType` is absent.                                                    | Temperature, power, occupancy, battery level             |
| `"categorical"` | Discrete state from a fixed set of values (integer, string enum or boolean). No arithmetic aggregation applies.                                                          | Occupancy status, alarm state, door open/closed          |

```json
"kiloWattHours": {
  "measurementType": "akenza/electricity/activeEnergy/kiloWattHours",
  "title": "Active Energy",
  "description": "Active Energy in kWh",
  "type": "number",
  "unit": "kWh",
  "counterType": "monotonic"
}
```

```json
"liters": {
  "measurementType": "akenza/flow/consumption/l",
  "title": "Consumption",
  "description": "Liquid consumption in liters since last transmission",
  "type": "number",
  "unit": "l",
  "counterType": "delta"
}
```

Counter measurements currently defined across the data models:

| Schema        | counterType | Measurement types                                                       |
| ------------- | ----------- | ----------------------------------------------------------------------- |
| `electricity` | `monotonic` | `activeEnergy`, `apparentEnergy`, `reactiveEnergy` (all units)          |
| `electricity` | `delta`     | `activeEnergy`, `apparentEnergy`, `reactiveEnergy` (`*Delta` unit keys) |
| `flow`        | `monotonic` | `consumption/l`, `volume/l`, `volume/m3`                                |
| `flow`        | `delta`     | `consumption/lDelta`, `volume/lDelta`, `volume/m3Delta`                 |
| `ios`         | `monotonic` | `pulseInput/count`, `buttonEvent/count`, `reedContact/count`            |

## Guidelines

- The unit should not be repeated in the name
- The name should be concise and the description should be used to add more information
- Add `"counterType": "monotonic"` to any measurement that is an ever-increasing counter and never resets under normal operation
- Add `"counterType": "delta"` to any measurement where the device reports the increment since its last transmission rather than the absolute total
- `"counterType": "gauge"` is the default when the field is absent; set it explicitly only when you want to make the intent unambiguous
- Add `"counterType": "categorical"` to any measurement whose value is a string enum or boolean — the platform will not attempt arithmetic aggregation on it

## Generating Schemas from CSV

The two Jupyter notebooks `schemas-to-csv.ipynb` and `csv-to-schemas.ipynb` can be used to convert the existing measurement type schemas into a csv for easier editing and back to measurement type schemas.

Run the following commands to run the notebooks:

```
cd data-models
pip3 install -U virtualenv
virtualenv .venv
source .venv/bin/activate
pip install jupyterlab pandas
jupyter lab
```
