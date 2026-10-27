import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Refrigerant Monitor uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let temperatureSchema = null;
  let humiditySchema = null;
  let pressureSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    pressureSchema = loadSchema(`${import.meta.dirname}/pressure.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Refrigerant Monitor payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0200000008000111a60d00010107100000331600116d00130d00116d0110",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4518);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 26.3);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 51);
      });

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.temperature, 27.2);
      });

      expectSample("pressure", pressureSchema, (data) => {
        assert.equal(data.pressure, 0.19);
      });

      consume(data);
    });
  });
});
