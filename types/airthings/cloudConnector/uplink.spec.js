const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Airthings Cloud Connector Uplink", () => {
  let airlySchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/airly.schema.json`)
      .then((parsedSchema) => {
        airlySchema = parsedSchema;
        done();
      });
  });

  let environmentSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/environment.schema.json`)
      .then((parsedSchema) => {
        environmentSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let moldSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/mold.schema.json`)
      .then((parsedSchema) => {
        moldSchema = parsedSchema;
        done();
      });
  });

  let occupancySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  let radonSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/radon.schema.json`)
      .then((parsedSchema) => {
        radonSchema = parsedSchema;
        done();
      });
  });

  let ventilationSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/ventilation.schema.json`)
      .then((parsedSchema) => {
        ventilationSchema = parsedSchema;
        done();
      });
  });

  let virusSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/virus.schema.json`)
      .then((parsedSchema) => {
        virusSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Airthings Cloud Connector environment payload", () => {
      const data = {
        data: {
          "serialNumber": "3110000280",
          "recorded": "2024-01-03T08:09:05Z",
          "temp": 20.8,
          "pressure": 990.1,
          "humidity": 20,
          "co2": 612,
          "soundLevelA": 26,
          "rssi": -52,
          "batteryPercentage": 99,
          "ratings": {
            "humidity": "POOR",
            "temp": "GOOD",
            "pressure": "GOOD",
            "co2": "GOOD"
          },
          "sensorUnits": {
            "humidity": "pct",
            "temp": "c",
            "pressure": "hpa",
            "soundLevelA": "dbspl",
            "co2": "ppm"
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "environment");
        assert.equal(value.data.temperature, 20.8);
        assert.equal(value.data.temperatureF, 69.44);
        assert.equal(value.data.pressure, 990.1);
        assert.equal(value.data.humidity, 20);
        assert.equal(value.data.co2, 612);
        assert.equal(value.data.soundLevelA, 26);

        assert.equal(value.data.co2Rating, 'GOOD');
        assert.equal(value.data.humidityRating, 'POOR');
        assert.equal(value.data.pressureRating, 'GOOD');
        assert.equal(value.data.temperatureRating, 'GOOD');

        // assert.equal(value.timestamp, new Date("2024-01-03T08:09:05Z"))

        utils.validateSchema(value.data, environmentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 99);
        assert.equal(value.data.rssi, -52);
        assert.equal(value.data.serialNumber, "3110000280");

        utils.validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value.environment, "object");

        assert.equal(value.environment.temperature, 20.8);
        assert.equal(value.environment.temperatureF, 69.44);
        assert.equal(value.environment.pressure, 990.1);
        assert.equal(value.environment.humidity, 20);
        assert.equal(value.environment.co2, 612);
        assert.equal(value.environment.soundLevelA, 26);

        assert.equal(value.environment.co2Rating, 'GOOD');
        assert.equal(value.environment.humidityRating, 'POOR');
        assert.equal(value.environment.pressureRating, 'GOOD');
        assert.equal(value.environment.temperatureRating, 'GOOD');
      });

      consume(data);
    });


    it("should decode the Airthings Cloud Connector environment payload and merge the new and old sample", () => {
      const data = {
        state: {
          environment: {
            temperature: 20.8,
            pressure: 990.1,
            humidity: 20,
            co2: 612,
            soundLevelA: 26,
            co2Rating: "GOOD",
            humidityRating: "POOR",
            pressureRating: "GOOD",
            temperatureRating: "GOOD"
          }
        },
        data: {
          "serialNumber": "3110000280",
          "recorded": "2024-01-03T08:09:05Z",
          "tvoc": 16,
          "temp": 10
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "environment");
        assert.equal(value.data.temperature, 10); // Testing if the new datapoint gets prioritiesed
        assert.equal(value.data.temperatureF, 50);
        assert.equal(value.data.pressure, 990.1);
        assert.equal(value.data.humidity, 20);
        assert.equal(value.data.co2, 612);
        assert.equal(value.data.soundLevelA, 26);
        assert.equal(value.data.tvoc, 16);

        assert.equal(value.data.co2Rating, 'GOOD');
        assert.equal(value.data.humidityRating, 'POOR');
        assert.equal(value.data.pressureRating, 'GOOD');
        assert.equal(value.data.temperatureRating, 'GOOD');

        // assert.equal(value.timestamp, new Date("2024-01-03T08:09:05Z"))

        utils.validateSchema(value.data, environmentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value.environment, "object");

        assert.equal(value.environment.temperature, 10);
        assert.equal(value.environment.temperatureF, 50);
        assert.equal(value.environment.pressure, 990.1);
        assert.equal(value.environment.humidity, 20);
        assert.equal(value.environment.co2, 612);
        assert.equal(value.environment.soundLevelA, 26);
        assert.equal(value.environment.tvoc, 16);

        assert.equal(value.environment.co2Rating, 'GOOD');
        assert.equal(value.environment.humidityRating, 'POOR');
        assert.equal(value.environment.pressureRating, 'GOOD');
        assert.equal(value.environment.temperatureRating, 'GOOD');
      });

      consume(data);
    });

    it("should decode the Airthings Cloud Connector mold payload", () => {
      const data = {
        data: {
          "serialNumber": "0000000000",
          "recorded": "2023-10-02T20:00:00Z",
          "mold": 1,
          "ratings": {
            "mold": "GOOD"
          },
          "sensorUnits": {
            "mold": "riskIndex"
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "mold");
        assert.equal(value.data.moldRisk, 1);
        assert.equal(value.data.moldRiskRating, "GOOD");

        utils.validateSchema(value.data, moldSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value.mold, "object");

        assert.equal(value.mold.moldRisk, 1);
        assert.equal(value.mold.moldRiskRating, "GOOD");
      });

      consume(data);
    });

    it("should decode the Airthings Cloud Connector virus payload", () => {
      const data = {
        data: {
          "serialNumber": "2969015904",
          "recorded": "2023-07-06T07:00:00",
          "virusRisk": 1.0,
          "ratings": {
            "virusRisk": "GOOD"
          },
          "sensorUnits": {
            "virusRisk": "riskIndex"
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "virus");
        assert.equal(value.data.virusRisk, 1);
        assert.equal(value.data.virusRiskRating, "GOOD");

        utils.validateSchema(value.data, virusSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value.virus, "object");

        assert.equal(value.virus.virusRisk, 1);
        assert.equal(value.virus.virusRiskRating, "GOOD");
      });
      consume(data);
    });

    it("should decode the Airthings Cloud Connector radon payload", () => {
      const data = {
        data: {
          "serialNumber": "0000000000",
          "hourlyRadon": 0.5,
          "ratings": {
            "hourlyRadon": "GOOD"
          },
          "sensorUnits": {
            "hourlyRadon": "pci"
          },
          "recorded": "2023-11-30T10:00:00Z"
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "radon");
        assert.equal(value.data.hourlyRadon, 0.5);
        assert.equal(value.data.hourlyRadonRating, "GOOD");

        utils.validateSchema(value.data, radonSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value.radon, "object");

        assert.equal(value.radon.hourlyRadon, 0.5);
        assert.equal(value.radon.hourlyRadonRating, "GOOD");
      });
      consume(data);
    });

    it("should decode the Airthings Cloud Connector occupancy payload", () => {
      const data = {
        data: {
          "serialNumber": "2969000446",
          "recorded": "2023-07-06T07:15",
          "occupants": 2,
          "occupantsUpper": 4,
          "occupantsLower": 0,
          "sensorUnits": {
            "occupants": "occ"
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 2);
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.occupants, 2);

        utils.validateSchema(value.data, occupancySchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        // Occupancy consists only of one datapoint so a state does not make sense here
      });
      consume(data);
    });

    it("should decode the Airthings Cloud Connector ventilation payload", () => {
      const data = {
        data: {
          "serialNumber": "2930047924",
          "recorded": "2024-07-05T10:40:00Z",
          "airflow": 98.93,
          "airExchangeRate": 4.46,
          "sensorUnits": {
            "airExchangeRate": "ach",
            "airflow": "m3h"
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ventilation");
        assert.equal(value.data.airflow, 98.93);
        assert.equal(value.data.airExchangeRate, 4.46);

        utils.validateSchema(value.data, ventilationSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value.ventilation, "object");

        assert.equal(value.ventilation.airflow, 98.93);
        assert.equal(value.ventilation.airExchangeRate, 4.46);
      });
      consume(data);
    });

    it("should decode the Airthings Cloud Connector airly payload", () => {
      const data = {
        data: {
          "serialNumber": "ARL0000000",
          "recorded": "2023-11-30T10:00:00Z",
          "outdoorHumidity": 73,
          "outdoorPm10": 28,
          "outdoorPm1": 13,
          "outdoorPm25": 22,
          "outdoorPressure": 1002.8,
          "outdoorTemp": -2.5,
          "ratings": {
            "outdoorPm25": "FAIR",
            "outdoorPm1": "FAIR",
            "outdoorPm10": "FAIR",
            "outdoorPressure": "GOOD"
          },
          "sensorUnits": {
            "outdoorPm25": "mgpc",
            "outdoorPm1": "mgpc",
            "outdoorPm10": "mgpc",
            "outdoorHumidity": "pct",
            "outdoorTemp": "c",
            "outdoorPressure": "hpa"
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "airly");
        assert.equal(value.data.humidity, 73);
        assert.equal(value.data.temperature, -2.5);
        assert.equal(value.data.temperatureF, 27.5);
        assert.equal(value.data.pressure, 1002.8);

        assert.equal(value.data.pm1, 13);
        assert.equal(value.data.pm2_5, 22);
        assert.equal(value.data.pm10, 28);

        assert.equal(value.data.pm1Rating, "FAIR");
        assert.equal(value.data.pm2_5Rating, "FAIR");
        assert.equal(value.data.pm10Rating, "FAIR");

        utils.validateSchema(value.data, airlySchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value.airly, "object");

        assert.equal(value.airly.humidity, 73);
        assert.equal(value.airly.temperature, -2.5);
        assert.equal(value.airly.temperatureF, 27.5);
        assert.equal(value.airly.pressure, 1002.8);

        assert.equal(value.airly.pm1, 13);
        assert.equal(value.airly.pm2_5, 22);
        assert.equal(value.airly.pm10, 28);

        assert.equal(value.airly.pm1Rating, "FAIR");
        assert.equal(value.airly.pm2_5Rating, "FAIR");
        assert.equal(value.airly.pm10Rating, "FAIR");
      });
      consume(data);
    });

    it("should decode Airthings Cloud Connector pm payload", () => {
      const data = {
        state: {
          environment: {
            temperature: 23.5
          }
        },
        data: {
          "tvoc": 82,
          "rssi": -79,
          "serialNumber": "2969002870",
          "pm25": 5,
          "pm1": 5,
          "ratings": {
            "pm25": "GOOD",
            "pm1": "GOOD",
            "pm10": "GOOD",
            "voc": "GOOD"
          },
          "sensorUnits": {
            "pm25": "mgpc",
            "pm1": "mgpc",
            "pm10": "mgpc",
            "pressure": "hpa",
            "voc": "ppb",
            "soundLevelA": "dbspl"
          },
          "pm10": 5,
          "batteryPercentage": 94,
          "pressure": 1011.2,
          "recorded": "2025-07-14T11:53:55Z",
          "soundLevelA": 52
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "environment");
        assert.equal(value.data.tvoc, 82);
        assert.equal(value.data.soundLevelA, 52);
        assert.equal(value.data.pressure, 1011.2);
        assert.equal(value.data.temperature, 23.5);
        assert.equal(value.data.temperatureF, 74.3);
        assert.equal(value.data.pm1, 5);
        assert.equal(value.data.pm2_5, 5);
        assert.equal(value.data.pm10, 5);

        assert.equal(value.data.pm1Rating, "GOOD");
        assert.equal(value.data.pm2_5Rating, "GOOD");
        assert.equal(value.data.pm10Rating, "GOOD");
        assert.equal(value.data.tvocRating, "GOOD");

        utils.validateSchema(value.data, environmentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 94);
        assert.equal(value.data.rssi, -79);
        assert.equal(value.data.serialNumber, "2969002870");

        utils.validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value.environment, "object");

        assert.equal(value.environment.tvoc, 82);
        assert.equal(value.environment.soundLevelA, 52);
        assert.equal(value.environment.pressure, 1011.2);
        assert.equal(value.environment.temperature, 23.5);
        assert.equal(value.environment.temperatureF, 74.3);
        assert.equal(value.environment.pm1, 5);
        assert.equal(value.environment.pm2_5, 5);
        assert.equal(value.environment.pm10, 5);

        assert.equal(value.environment.pm1Rating, "GOOD");
        assert.equal(value.environment.pm2_5Rating, "GOOD");
        assert.equal(value.environment.pm10Rating, "GOOD");
        assert.equal(value.environment.tvocRating, "GOOD");
      });
      consume(data);
    });
  });
});
