import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Meter Pulse uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let periodicPulseCntSchema = null;
  let persistentPulseCntSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    periodicPulseCntSchema = loadSchema(`${import.meta.dirname}/periodic_pulse_cnt.schema.json`);
    persistentPulseCntSchema = loadSchema(`${import.meta.dirname}/persistent_pulse_cnt.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Meter Pulse payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0206000008000112d40d000100e71000001f5c00070000025800d37669",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4820);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 23.1);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 31);
      });

      expectSample("periodic_pulse_cnt", periodicPulseCntSchema, (data) => {
        assert.equal(data.periodicPulseCnt, 600);
      });

      expectSample("persistent_pulse_cnt", persistentPulseCntSchema, (data) => {
        assert.equal(data.persistentPulseCnt, 13858409);
      });

      consume(data);
    });
  });
});
