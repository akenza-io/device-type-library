import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Particulate Matter Sensor uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let accelerometerSchema = null;
  let massConcPm1Schema = null;
  let massConcPm25Schema = null;
  let massConcPm4Schema = null;
  let massConcPm10Schema = null;
  let partConcPm1Schema = null;
  let partConcPm25Schema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    accelerometerSchema = loadSchema(`${import.meta.dirname}/accelerometer.schema.json`);
    massConcPm1Schema = loadSchema(`${import.meta.dirname}/mass_conc_pm1.schema.json`);
    massConcPm25Schema = loadSchema(`${import.meta.dirname}/mass_conc_pm2_5.schema.json`);
    massConcPm4Schema = loadSchema(`${import.meta.dirname}/mass_conc_pm4.schema.json`);
    massConcPm10Schema = loadSchema(`${import.meta.dirname}/mass_conc_pm10.schema.json`);
    partConcPm1Schema = loadSchema(`${import.meta.dirname}/part_conc_pm1.schema.json`);
    partConcPm25Schema = loadSchema(`${import.meta.dirname}/part_conc_pm2_5.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Particulate Matter Sensor (batteryVoltage,internalTemperature,humidity,accelerometer) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "020000000800011bb90d000100cb10000018410005fffb00120058",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 7097);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 20.3);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 24);
      });

      expectSample("accelerometer", accelerometerSchema, (data) => {
        assert.equal(data.accelerometerX, -0.5);
        assert.equal(data.accelerometerY, 1.8);
        assert.equal(data.accelerometerZ, 8.8);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Particulate Matter Sensor (Mass Concentrations: PM1, PM2.5, PM4, PM10, Particle Concentrations: PM1, PM2.5) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "02010079250011010052250011020056250011030056250011040056240011110041240011120041",
        },
      };

      expectSample("mass_conc_pm1", massConcPm1Schema, (data) => {
        assert.equal(data.massConcPm1, 8.2);
      });

      expectSample("mass_conc_pm2_5", massConcPm25Schema, (data) => {
        assert.equal(data.massConcPm2_5, 8.6);
      });

      expectSample("mass_conc_pm4", massConcPm4Schema, (data) => {
        assert.equal(data.massConcPm4, 8.6);
      });

      expectSample("mass_conc_pm10", massConcPm10Schema, (data) => {
        assert.equal(data.massConcPm10, 8.6);
      });

      expectSample("part_conc_pm1", partConcPm1Schema, (data) => {
        assert.equal(data.partConcPm1, 65);
      });

      expectSample("part_conc_pm2_5", partConcPm25Schema, (data) => {
        assert.equal(data.partConcPm2_5, 65);
      });

      consume(data);
    });
  });
});
