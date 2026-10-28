import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO H2O uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let accelerometerSchema = null;
  let floodStateSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    accelerometerSchema = loadSchema(`${import.meta.dirname}/accelerometer.schema.json`);
    floodStateSchema = loadSchema(`${import.meta.dirname}/flood_state.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO H2O payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0226000004000000410005ffc50030006f0800010d480d000100e21000001f",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 3400);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 22.6);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 31);
      });

      expectSample("flood_state", floodStateSchema, (data) => {
        assert.equal(data.floodState, 0);
      });

      expectSample("accelerometer", accelerometerSchema, (data) => {
        assert.equal(data.accelerometerX, -5.9);
        assert.equal(data.accelerometerY, 4.8);
        assert.equal(data.accelerometerZ, 11.1);
      });

      consume(data);
    });
  });
});
