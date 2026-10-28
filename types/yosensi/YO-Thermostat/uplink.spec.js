import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Thermostat uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let illuminanceSchema = null;
  let co2Schema = null;
  let presenceCounterSchema = null;
  let comfortSetpointSchema = null;
  let standbyOffsetSchema = null;
  let economyOffsetSchema = null;
  let frostProtSetpointSchema = null;
  let operationModeSchema = null;
  let getParametersSchema = null;
  let outputSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    illuminanceSchema = loadSchema(`${import.meta.dirname}/illuminance.schema.json`);
    co2Schema = loadSchema(`${import.meta.dirname}/co2.schema.json`);
    presenceCounterSchema = loadSchema(`${import.meta.dirname}/presence_counter.schema.json`);
    comfortSetpointSchema = loadSchema(`${import.meta.dirname}/comfort_setpoint.schema.json`);
    standbyOffsetSchema = loadSchema(`${import.meta.dirname}/standby_offset.schema.json`);
    economyOffsetSchema = loadSchema(`${import.meta.dirname}/economy_offset.schema.json`);
    frostProtSetpointSchema = loadSchema(`${import.meta.dirname}/frost_prot_setpoint.schema.json`);
    operationModeSchema = loadSchema(`${import.meta.dirname}/operation_mode.schema.json`);
    getParametersSchema = loadSchema(`${import.meta.dirname}/get_parameters.schema.json`);
    outputSchema = loadSchema(`${import.meta.dirname}/output.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Thermostat (Commands [07-0d]) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "02090000fd00110700d2fd001108ffecfd001109ffd8fd00110a0046fc00100b03fd00110c00aafc00100d01",
        },
      };

      expectSample("comfort_setpoint", comfortSetpointSchema, (data) => {
        assert.equal(data.comfortSetpoint, 21);
      });

      expectSample("standby_offset", standbyOffsetSchema, (data) => {
        assert.equal(data.standbyOffset, -2);
      });

      expectSample("economy_offset", economyOffsetSchema, (data) => {
        assert.equal(data.economyOffset, -4);
      });

      expectSample("frost_prot_setpoint", frostProtSetpointSchema, (data) => {
        assert.equal(data.frostProtSetpoint, 7);
      });

      expectSample("operation_mode", operationModeSchema, (data) => {
        assert.equal(data.operationMode, 3);
      });

      expectSample("get_parameters", getParametersSchema, (data) => {
        assert.equal(data.getParameters, 17);
      });

      expectSample("output", outputSchema, (data) => {
        assert.equal(data.output, 1);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Thermostat (batteryVoltage,internalTemperature,humidity,illuminance,presenceCounter) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "020a000008000111510d000100a71000001c1a000100086000010032",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4433);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 16.7);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 28);
      });

      expectSample("illuminance", illuminanceSchema, (data) => {
        assert.equal(data.illuminance, 0.08);
      });

      expectSample("presence_counter", presenceCounterSchema, (data) => {
        assert.equal(data.presenceCounter, 50);
      });

      consume(data);
    });
    it("should decode the Yosensi YO Thermostat (batteryVoltage,internalTemperature,humidity,co2,illuminance,presenceCounter) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "027D000008000110800D000101061000003B6C000102F31A000101396000010012",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4224);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 26.2);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 59);
      });

      expectSample("co2", co2Schema, (data) => {
        assert.equal(data.co2, 755);
      });

      expectSample("illuminance", illuminanceSchema, (data) => {
        assert.equal(data.illuminance, 3.13);
      });

      expectSample("presence_counter", presenceCounterSchema, (data) => {
        assert.equal(data.presenceCounter, 18);
      });
      consume(data);
    });
  });
});
