import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("WT201 Uplink", () => {
  let defaultSchema = null;
  let systemSchema = null;
  let wiresSchema = null;
  let planSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    wiresSchema = loadSchema(`${import.meta.dirname}/wires.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    planSchema = loadSchema(`${import.meta.dirname}/plan.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WT201 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "036702010467A60005E70006E80007BC00",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.fanMode, "AUTO");
        assert.equal(data.fanStatus, "STANDBY");
        assert.equal(data.planEvent, "NOT_EXCECUTED");
        assert.equal(data.temperature, 25.8);
        assert.equal(data.temperatureTarget, 16.6);
        assert.equal(data.temperatureControlMode, "HEAT");
        assert.equal(data.temperatureControlStatus, "STANDBY");
      });

      consume(data);
    });

    it("should decode should decode the WT201 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FFCB0D1101FFCA158004",
        },
      };

      expectSample("system", systemSchema, (data) => {
        assert.deepEqual(data.temperatureControlModeEnabled, [
          "HEAT",
          "COOL",
          "AUTO",
        ]);
        assert.deepEqual(data.temperatureControlStatusEnabled, [
          "STAGE_1_HEAT",
          "AUX_HEAT",
          "STAGE_1_COOL",
        ]);
      });

      expectSample("wires", wiresSchema, (data) => {
        assert.equal(data.obMode, "HEAT");
        assert.deepEqual(data.wires, ['Y1', 'GH', 'OB', 'AUX']);
      });

      consume(data);
    });

    it("should decode should decode the WT201 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FFC900000000B302FFC9020101280000",
        },
      };

      expectSample("plan", planSchema, (data) => {
        assert.equal(data.index, 1);
        assert.equal(data.planEnabled, "DISABLED");
        assert.equal(data.time, "11:31");
        assert.equal(data.type, "WAKE");
        assert.deepEqual(data.weekRecycle, []);
      });

      expectSample("plan", planSchema, (data) => {
        assert.equal(data.index, 2);
        assert.equal(data.planEnabled, "ENABLED");
        assert.equal(data.time, "0:00");
        assert.equal(data.type, "HOME");
        assert.deepEqual(data.weekRecycle, ["WED", "FRI"]);
      });

      consume(data);
    });
  });
});
