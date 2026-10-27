import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Temp uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let externalTemperature1Schema = null;
  let externalTemperature2Schema = null;
  let externalTemperature3Schema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    externalTemperature1Schema = loadSchema(`${import.meta.dirname}/external_temperature_1.schema.json`);
    externalTemperature2Schema = loadSchema(`${import.meta.dirname}/external_temperature_2.schema.json`);
    externalTemperature3Schema = loadSchema(`${import.meta.dirname}/external_temperature_3.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Temp payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0200000008000111880d000100f7100000380d00110000ea0d00110100db0d00110200d6",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4488);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 24.7);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 56);
      });

      expectSample("external_temperature_1", externalTemperature1Schema, (data) => {
        assert.equal(data.externalTemperature1, 23.4);
      });

      expectSample("external_temperature_2", externalTemperature2Schema, (data) => {
        assert.equal(data.externalTemperature2, 21.9);
      });

      expectSample("external_temperature_3", externalTemperature3Schema, (data) => {
        assert.equal(data.externalTemperature3, 21.4);
      });

      consume(data);
    });
  });
});
