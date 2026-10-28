import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO 360 uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let accelerometerSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    accelerometerSchema = loadSchema(`${import.meta.dirname}/accelerometer.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO 360 payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "020000000800010b620d000100f61000002f41001519fff9001e005b",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 2914);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 24.6);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 47);
      });

      expectSample("accelerometer", accelerometerSchema, (data) => {
        assert.equal(data.accelerometerX, -0.7);
        assert.equal(data.accelerometerY, 3);
        assert.equal(data.accelerometerZ, 9.1);
      });

      consume(data);
    });
  });
});
