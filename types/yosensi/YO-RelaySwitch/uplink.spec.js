import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Relay Switch uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let relayStateCH1Schema = null;
  let relayStateCH2Schema = null;
  let relayStateAllCHSchema = null;
  let outputModeCH1Schema = null;
  let outputModeCH2Schema = null;
  let outputModeAllCHSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    relayStateCH1Schema = loadSchema(`${import.meta.dirname}/relay_state_ch1.schema.json`);
    relayStateCH2Schema = loadSchema(`${import.meta.dirname}/relay_state_ch2.schema.json`);
    relayStateAllCHSchema = loadSchema(`${import.meta.dirname}/relay_state_all_ch.schema.json`);
    outputModeCH1Schema = loadSchema(`${import.meta.dirname}/output_mode_ch1.schema.json`);
    outputModeCH2Schema = loadSchema(`${import.meta.dirname}/output_mode_ch2.schema.json`);
    outputModeAllCHSchema = loadSchema(`${import.meta.dirname}/output_mode_all_ch.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Relay Switch (batteryVoltage,relayStateAllCH,outputModeAllCH) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "025400000800015e50040011ff0002640011ff0000",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 24144);
      });

      expectSample("relay_state_all_ch", relayStateAllCHSchema, (data) => {
        assert.equal(data.relayStateAllCH, 2);
      });

      expectSample("output_mode_all_ch", outputModeAllCHSchema, (data) => {
        assert.equal(data.outputModeAllCH, 0);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Relay Switch (relayStateCH1,relayStateAllCH) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "024c00000400100000040011ff0002",
        },
      };

      expectSample("relay_state_ch1", relayStateCH1Schema, (data) => {
        assert.equal(data.relayStateCH1, 0);
      });

      expectSample("relay_state_all_ch", relayStateAllCHSchema, (data) => {
        assert.equal(data.relayStateAllCH, 2);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Relay Switch (relayStateCH2,relayStateAllCH) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "024c00000400100101040011ff0002",
        },
      };

      expectSample("relay_state_ch2", relayStateCH2Schema, (data) => {
        assert.equal(data.relayStateCH2, 1);
      });

      expectSample("relay_state_all_ch", relayStateAllCHSchema, (data) => {
        assert.equal(data.relayStateAllCH, 2);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Relay Switch (outputModeCH1,outputModeAllCH) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "02a600006400100001640011ff0004",
        },
      };

      expectSample("output_mode_ch1", outputModeCH1Schema, (data) => {
        assert.equal(data.outputModeCH1, 1);
      });

      expectSample("output_mode_all_ch", outputModeAllCHSchema, (data) => {
        assert.equal(data.outputModeAllCH, 4);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Relay Switch (outputModeCH2,outputModeAllCH) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "02a600006400100100640011ff0004",
        },
      };

      expectSample("output_mode_ch2", outputModeCH2Schema, (data) => {
        assert.equal(data.outputModeCH2, 0);
      });

      expectSample("output_mode_all_ch", outputModeAllCHSchema, (data) => {
        assert.equal(data.outputModeAllCH, 4);
      });

      consume(data);
    });
  });
});
