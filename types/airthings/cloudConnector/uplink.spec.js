import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";

describe("Airthings Cloud Connector Uplink", () => {
  let airlySchema = null;
  let consume = null;
  let environmentSchema = null;
  let lifecycleSchema = null;
  let moldSchema = null;
  let occupancySchema = null;
  let radonSchema = null;
  let ventilationSchema = null;
  let virusSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    airlySchema = loadSchema(`${import.meta.dirname}/airly.schema.json`);
    environmentSchema = loadSchema(`${import.meta.dirname}/environment.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    moldSchema = loadSchema(`${import.meta.dirname}/mold.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
    radonSchema = loadSchema(`${import.meta.dirname}/radon.schema.json`);
    ventilationSchema = loadSchema(`${import.meta.dirname}/ventilation.schema.json`);
    virusSchema = loadSchema(`${import.meta.dirname}/virus.schema.json`);
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
          "light": 13,
          "batteryPercentage": 99,
          "ratings": {
            "humidity": "POOR",
            "temp": "GOOD",
            "pressure": "GOOD",
            "co2": "GOOD",
            "light": "GOOD"
          },
          "sensorUnits": {
            "humidity": "pct",
            "temp": "c",
            "pressure": "hpa",
            "soundLevelA": "dbspl",
            "co2": "ppm",
            "light": "pct"
          }
        }
      };

      expectEmits((type, value) => {
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
        assert.equal(value.data.light, 13);

        assert.equal(value.data.co2Rating, 'GOOD');
        assert.equal(value.data.humidityRating, 'POOR');
        assert.equal(value.data.pressureRating, 'GOOD');
        assert.equal(value.data.temperatureRating, 'GOOD');
        assert.equal(value.data.lightRating, 'GOOD');

        // assert.equal(value.timestamp, new Date("2024-01-03T08:09:05Z"))

        validateSchema(value.data, environmentSchema, {
          throwError: true,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 99);
        assert.equal(data.rssi, -52);
        assert.equal(data.serialNumber, "3110000280");
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value.environment, "object");

        assert.equal(value.environment.temperature, 20.8);
        assert.equal(value.environment.temperatureF, 69.44);
        assert.equal(value.environment.pressure, 990.1);
        assert.equal(value.environment.humidity, 20);
        assert.equal(value.environment.co2, 612);
        assert.equal(value.environment.soundLevelA, 26);
        assert.equal(value.environment.light, 13);

        assert.equal(value.environment.co2Rating, 'GOOD');
        assert.equal(value.environment.humidityRating, 'POOR');
        assert.equal(value.environment.pressureRating, 'GOOD');
        assert.equal(value.environment.temperatureRating, 'GOOD');
        assert.equal(value.environment.lightRating, 'GOOD');
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
            light: 13,
            co2Rating: "GOOD",
            humidityRating: "POOR",
            pressureRating: "GOOD",
            temperatureRating: "GOOD",
            lightRating: "GOOD"
          }
        },
        data: {
          "serialNumber": "3110000280",
          "recorded": "2024-01-03T08:09:05Z",
          "tvoc": 16,
          "temp": 10,
          "light": 14
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "environment");
        assert.equal(value.data.temperature, 10); // Testing if the new datapoint gets prioritised
        assert.equal(value.data.temperatureF, 50);
        assert.equal(value.data.pressure, 990.1);
        assert.equal(value.data.humidity, 20);
        assert.equal(value.data.co2, 612);
        assert.equal(value.data.soundLevelA, 26);
        assert.equal(value.data.tvoc, 16);
        assert.equal(value.data.light, 14);

        assert.equal(value.data.co2Rating, 'GOOD');
        assert.equal(value.data.humidityRating, 'POOR');
        assert.equal(value.data.pressureRating, 'GOOD');
        assert.equal(value.data.temperatureRating, 'GOOD');
        assert.equal(value.data.lightRating, 'GOOD');

        // assert.equal(value.timestamp, new Date("2024-01-03T08:09:05Z"))

        validateSchema(value.data, environmentSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
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
        assert.equal(value.environment.light, 14);

        assert.equal(value.environment.co2Rating, 'GOOD');
        assert.equal(value.environment.humidityRating, 'POOR');
        assert.equal(value.environment.pressureRating, 'GOOD');
        assert.equal(value.environment.temperatureRating, 'GOOD');
        assert.equal(value.environment.lightRating, 'GOOD');
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

      expectSample("mold", moldSchema, (data) => {
        assert.equal(data.moldRisk, 1);
        assert.equal(data.moldRiskRating, "GOOD");
      });

      expectEmits((type, value) => {
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

      expectSample("virus", virusSchema, (data) => {
        assert.equal(data.virusRisk, 1);
        assert.equal(data.virusRiskRating, "GOOD");
      });

      expectEmits((type, value) => {
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

      expectSample("radon", radonSchema, (data) => {
        assert.equal(data.hourlyRadon, 0.5);
        assert.equal(data.hourlyRadonRating, "GOOD");
      });

      expectEmits((type, value) => {
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

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupancy, 1);
        assert.equal(data.occupied, true);
        assert.equal(data.occupants, 2);
      });

      expectEmits((type, value) => {
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

      expectSample("ventilation", ventilationSchema, (data) => {
        assert.equal(data.airflow, 98.93);
        assert.equal(data.airExchangeRate, 4.46);
      });

      expectEmits((type, value) => {
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

      expectSample("airly", airlySchema, (data) => {
        assert.equal(data.humidity, 73);
        assert.equal(data.temperature, -2.5);
        assert.equal(data.temperatureF, 27.5);
        assert.equal(data.pressure, 1002.8);

        assert.equal(data.pm1, 13);
        assert.equal(data.pm2_5, 22);
        assert.equal(data.pm10, 28);

        assert.equal(data.pm1Rating, "FAIR");
        assert.equal(data.pm2_5Rating, "FAIR");
        assert.equal(data.pm10Rating, "FAIR");
      });

      expectEmits((type, value) => {
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

      expectSample("environment", environmentSchema, (data) => {
        assert.equal(data.tvoc, 82);
        assert.equal(data.soundLevelA, 52);
        assert.equal(data.pressure, 1011.2);
        assert.equal(data.temperature, 23.5);
        assert.equal(data.temperatureF, 74.3);
        assert.equal(data.pm1, 5);
        assert.equal(data.pm2_5, 5);
        assert.equal(data.pm10, 5);

        assert.equal(data.pm1Rating, "GOOD");
        assert.equal(data.pm2_5Rating, "GOOD");
        assert.equal(data.pm10Rating, "GOOD");
        assert.equal(data.tvocRating, "GOOD");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 94);
        assert.equal(data.rssi, -79);
        assert.equal(data.serialNumber, "2969002870");
      });

      expectEmits((type, value) => {
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
