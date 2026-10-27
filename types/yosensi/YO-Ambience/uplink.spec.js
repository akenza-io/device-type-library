import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Ambience uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let co2Schema = null;
  let illuminanceSchema = null;
  let presenceCounterSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    co2Schema = loadSchema(`${import.meta.dirname}/co2.schema.json`);
    illuminanceSchema = loadSchema(`${import.meta.dirname}/illuminance.schema.json`);
    presenceCounterSchema = loadSchema(`${import.meta.dirname}/presence_counter.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Ambience payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "02460000080001115c0d000100c0100000256c0001028c1a0001000b6000010003",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4444);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 19.2);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 37);
      });

      expectSample("co2", co2Schema, (data) => {
        assert.equal(data.co2, 652);
      });

      expectSample("illuminance", illuminanceSchema, (data) => {
        assert.equal(data.illuminance, 0.11);
      });

      expectSample("presence_counter", presenceCounterSchema, (data) => {
        assert.equal(data.presenceCounter, 3);
      });

      consume(data);
    });
  });
});
