import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO AgriBox uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let outputVoltageCh1Schema = null;
  let outputVoltageCh2Schema = null;
  let outputVoltageCh3Schema = null;
  let outputVoltageCh4Schema = null;
  let soilMoisture1Schema = null;
  let soilMoisture2Schema = null;
  let soilMoisture3Schema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    outputVoltageCh1Schema = loadSchema(`${import.meta.dirname}/output_voltage_ch1.schema.json`);
    outputVoltageCh2Schema = loadSchema(`${import.meta.dirname}/output_voltage_ch2.schema.json`);
    outputVoltageCh3Schema = loadSchema(`${import.meta.dirname}/output_voltage_ch3.schema.json`);
    outputVoltageCh4Schema = loadSchema(`${import.meta.dirname}/output_voltage_ch4.schema.json`);
    soilMoisture1Schema = loadSchema(`${import.meta.dirname}/soil_moisture_1.schema.json`);
    soilMoisture2Schema = loadSchema(`${import.meta.dirname}/soil_moisture_2.schema.json`);
    soilMoisture3Schema = loadSchema(`${import.meta.dirname}/soil_moisture_3.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO AgriBox payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "021b0000080001129c0d000100e41000001d440007000800030002000066001100018a660011010187660011020187",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4764);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 22.8);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 29);
      });

      expectSample("output_voltage_ch1", outputVoltageCh1Schema, (data) => {
        assert.equal(data.outputVoltageCh1, 8);
      });

      expectSample("output_voltage_ch2", outputVoltageCh2Schema, (data) => {
        assert.equal(data.outputVoltageCh2, 3);
      });

      expectSample("output_voltage_ch3", outputVoltageCh3Schema, (data) => {
        assert.equal(data.outputVoltageCh3, 2);
      });

      expectSample("output_voltage_ch4", outputVoltageCh4Schema, (data) => {
        assert.equal(data.outputVoltageCh4, 0);
      });

      expectSample("soil_moisture_1", soilMoisture1Schema, (data) => {
        assert.equal(data.soilMoisture1, 3.94);
      });

      expectSample("soil_moisture_2", soilMoisture2Schema, (data) => {
        assert.equal(data.soilMoisture2, 3.91);
      });

      expectSample("soil_moisture_3", soilMoisture3Schema, (data) => {
        assert.equal(data.soilMoisture3, 3.91);
      });

      consume(data);
    });
  });
});
