import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Moko LW005-MP Uplink", () => {
  let countdownSchema = null;
  let consume = null;
  let energySchema = null;
  let consumptionSchema = null;
  let loadStateSchema = null;
  let overcurrentSchema = null;
  let overloadSchema = null;
  let overvoltageSchema = null;
  let powerSchema = null;
  let switchSchema = null;
  let undervoltageSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    countdownSchema = loadSchema(`${import.meta.dirname}/countdown.schema.json`);
    energySchema = loadSchema(`${import.meta.dirname}/energy.schema.json`);
    consumptionSchema = loadSchema(`${import.meta.dirname}/consumption.schema.json`);
    loadStateSchema = loadSchema(`${import.meta.dirname}/load_state.schema.json`);
    overcurrentSchema = loadSchema(`${import.meta.dirname}/overcurrent.schema.json`);
    overloadSchema = loadSchema(`${import.meta.dirname}/overload.schema.json`);
    overvoltageSchema = loadSchema(`${import.meta.dirname}/overvoltage.schema.json`);
    powerSchema = loadSchema(`${import.meta.dirname}/power.schema.json`);
    switchSchema = loadSchema(`${import.meta.dirname}/switch.schema.json`);
    undervoltageSchema = loadSchema(`${import.meta.dirname}/undervoltage.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Moko LW005-MP switch payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex:
            "68a7ec46100000",
        },
      };

      expectSample("switch", switchSchema, (data) => {
        assert.equal(data.acOutputState, "OFF");
        assert.equal(data.plugLoadStatus, "NO_LOAD");
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO energy payload", () => {
      const data = {
        data: {
          port: 6,
          payloadHex:
            "68a7ecfa1008b70000c32d",
        },
      };

      expectSample("energy", energySchema, (data) => {
        assert.equal(data.current, 0);
        assert.equal(data.voltage, 223.1);
        assert.equal(data.frequency, 49.965);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO power payload", () => {
      const data = {
        data: {
          port: 7,
          payloadHex:
            "68a7fe3e100000000064",
        },
      };

      expectSample("power", powerSchema, (data) => {
        assert.equal(data.activePower, 0);
        assert.equal(data.powerFactor, 100);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO consumption payload", () => {
      const data = {
        data: {
          port: 8,
          payloadHex:
            "68a81dd6100000020a0000",
        },
      };

      expectSample("consumption", consumptionSchema, (data) => {
        assert.equal(data.consumptionLastHour, 0);
        assert.equal(data.totalConsumption, 0.163125);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO overvoltage payload", () => {
      const data = {
        data: {
          port: 9,
          payloadHex:
            "68a81dd610010ce40898",
        },
      };

      expectSample("overvoltage", overvoltageSchema, (data) => {
        assert.equal(data.overvoltage, true);
        assert.equal(data.overvoltageThreshold, 220);
        assert.equal(data.voltage, 330);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO undervoltage payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex:
            "68a81dd6100108340898",
        },
      };

      expectSample("undervoltage", undervoltageSchema, (data) => {
        assert.equal(data.undervoltage, true);
        assert.equal(data.undervoltageThreshold, 220);
        assert.equal(data.voltage, 210);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO overcurrent payload", () => {
      const data = {
        data: {
          port: 11,
          payloadHex:
            "68a81dd6100103e803e6",
        },
      };

      expectSample("overcurrent", overcurrentSchema, (data) => {
        assert.equal(data.overcurrent, true);
        assert.equal(data.overcurrentThreshold, 0.998);
        assert.equal(data.current, 1);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO overload payload", () => {
      const data = {
        data: {
          port: 12,
          payloadHex:
            "68a81dd6100100640060",
        },
      };

      expectSample("overload", overloadSchema, (data) => {
        assert.equal(data.overload, true);
        assert.equal(data.overloadThreshold, 9.6);
        assert.equal(data.power, 2560);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO loadstate payload", () => {
      const data = {
        data: {
          port: 13,
          payloadHex:
            "0198d0c01b77020066310814aaedaf65",
        },
      };

      expectSample("load_state", loadStateSchema, (data) => {
        assert.equal(data.loadState, "LOAD_STOP");
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO countdown payload", () => {
      const data = {
        data: {
          port: 14,
          payloadHex:
            "68a81dd6100100000009",
        },
      };

      expectSample("countdown", countdownSchema, (data) => {
        assert.equal(data.acAfterCountdown, "ON");
        assert.equal(data.countdownTime, 9);
      });

      consume(data);
    });
  });
});
