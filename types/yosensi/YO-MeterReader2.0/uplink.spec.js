import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Meter Reader 2.0 uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let periodicPulseCntSchema = null;
  let persistentPulseCntSchema = null;
  let totalUnitsSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    periodicPulseCntSchema = loadSchema(`${import.meta.dirname}/periodic_pulse_cnt.schema.json`);
    persistentPulseCntSchema = loadSchema(`${import.meta.dirname}/persistent_pulse_cnt.schema.json`);
    totalUnitsSchema = loadSchema(`${import.meta.dirname}/total_units.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Meter Reader 2.0 payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "023e000108000111980d000100f3100000205c00070000024100009e6d99000300000029",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4504);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 24.3);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 32);
      });

      expectSample("periodic_pulse_cnt", periodicPulseCntSchema, (data) => {
        assert.equal(data.periodicPulseCnt, 577);
      });

      expectSample("persistent_pulse_cnt", persistentPulseCntSchema, (data) => {
        assert.equal(data.persistentPulseCnt, 40557);
      });

      expectSample("total_units", totalUnitsSchema, (data) => {
        assert.equal(data.totalUnits, 4.1);
      });

      consume(data);
    });
  });
});
