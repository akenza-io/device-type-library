import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Airflow Pro Dual uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let differentialPressure1Schema = null;
  let differentialPressure2Schema = null;
  let gasTemperature1Schema = null;
  let gasTemperature2Schema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    differentialPressure1Schema = loadSchema(`${import.meta.dirname}/differential_pressure_1.schema.json`);
    differentialPressure2Schema = loadSchema(`${import.meta.dirname}/differential_pressure_2.schema.json`);
    gasTemperature1Schema = loadSchema(`${import.meta.dirname}/gas_temperature_1.schema.json`);
    gasTemperature2Schema = loadSchema(`${import.meta.dirname}/gas_temperature_2.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Airflow Pro Dual payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "022e000008000112cc0d000100e51000001815000100000d00112500e61500110100000d00112600e5",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4812);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 22.9);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 24);
      });

      expectSample("differential_pressure_1", differentialPressure1Schema, (data) => {
        assert.equal(data.differentialPressure1, 0);
      });

      expectSample("differential_pressure_2", differentialPressure2Schema, (data) => {
        assert.equal(data.differentialPressure2, 0);
      });

      expectSample("gas_temperature_1", gasTemperature1Schema, (data) => {
        assert.equal(data.gasTemperature1, 23);
      });

      expectSample("gas_temperature_2", gasTemperature2Schema, (data) => {
        assert.equal(data.gasTemperature2, 22.9);
      });

      consume(data);
    });
  });
});
