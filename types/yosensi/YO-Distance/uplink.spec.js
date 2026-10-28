import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Distance uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let accelerometerSchema = null;
  let distanceSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    accelerometerSchema = loadSchema(`${import.meta.dirname}/accelerometer.schema.json`);
    distanceSchema = loadSchema(`${import.meta.dirname}/distance.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Distance (with accelerometer) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0200000008000112880d000100cd10000063280001012e4100050012ffe805fc",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4744);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 20.5);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 99);
      });

      expectSample("distance", distanceSchema, (data) => {
        assert.equal(data.distance, 302);
      });

      expectSample("accelerometer", accelerometerSchema, (data) => {
        assert.equal(data.accelerometerX, 1.8);
        assert.equal(data.accelerometerY, -2.4);
        assert.equal(data.accelerometerZ, 153.2);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Distance (without accelerometer) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "0228000008000112c40d000100e41000001d2800010159",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4804);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 22.8);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 29);
      });

      expectSample("distance", distanceSchema, (data) => {
        assert.equal(data.distance, 345);
      });

      consume(data);
    });
  });
});
