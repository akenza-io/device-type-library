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
