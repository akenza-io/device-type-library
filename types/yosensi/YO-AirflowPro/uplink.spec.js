import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Airflow Pro uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let differentialPressureSchema = null;
  let velocitySchema = null;
  let gasTemperatureSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    differentialPressureSchema = loadSchema(`${import.meta.dirname}/differential_pressure.schema.json`);
    velocitySchema = loadSchema(`${import.meta.dirname}/velocity.schema.json`);
    gasTemperatureSchema = loadSchema(`${import.meta.dirname}/gas_temperature.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Airflow Pro payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0205000008000112600d0001005e1000002c15000100650d001125006aa20001016a",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4704);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 9.4);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 44);
      });

      expectSample("differential_pressure", differentialPressureSchema, (data) => {
        assert.equal(data.differentialPressure, 10.1);
      });

      expectSample("gas_temperature", gasTemperatureSchema, (data) => {
        assert.equal(data.gasTemperature, 10.6);
      });

      expectSample("velocity", velocitySchema, (data) => {
        assert.equal(data.velocity, 3.62);
      });

      consume(data);
    });
  });
});
