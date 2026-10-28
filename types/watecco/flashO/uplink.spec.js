import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Watecco Flash'O Uplink", () => {
  let phase1Schema = null;
  let consume = null;
  let phase2Schema = null;
  let phase3Schema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    phase1Schema = loadSchema(`${import.meta.dirname}/phase1.schema.json`);
    phase2Schema = loadSchema(`${import.meta.dirname}/phase2.schema.json`);
    phase3Schema = loadSchema(`${import.meta.dirname}/phase3.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Watecco Flash'O 3 Phases uplink & state init", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "3606001146b300005c51b10708684b923d408052f31e",
        },
      };

      expectSample("phase1", phase1Schema, (data) => {
        assert.equal(data.pulse, 23633);
        assert.equal(data.relativePulse, 0);
      });

      expectSample("phase2", phase2Schema, (data) => {
        assert.equal(data.pulse, 93513);
        assert.equal(data.relativePulse, 0);
      });

      expectSample("phase3", phase3Schema, (data) => {
        assert.equal(data.pulse, 84685);
        assert.equal(data.relativePulse, 0);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse1, 23633);
        assert.equal(value.lastPulse2, 93513);
        assert.equal(value.lastPulse3, 84685);
      });

      consume(data);
    });

    it("should decode the Watecco Flash'O 3 Phases uplink, with customfields and state", () => {
      const data = {
        device: {
          customFields: {
            pulseType1: "consumption",
            multiplier1: 15,
            divider1: 250,
            pulseType2: "consumption",
            multiplier2: 8,
            divider2: 500,
            pulseType3: "consumption",
            multiplier3: 3,
            divider3: 250,
          },
        },
        state: {
          lastPulse1: 20633,
          lastPulse2: 93013,
          lastPulse3: 84485,
        },
        data: {
          port: 125,
          payloadHex: "3606001146b300005c51b10708684b923d408052f31e",
        },
      };

      expectSample("phase1", phase1Schema, (data) => {
        assert.equal(data.pulse, 23633);
        assert.equal(data.relativePulse, 3000);
        assert.equal(data.consumption, 180);
        assert.equal(data.consumptionCumulative, 1417.98);
      });

      expectSample("phase2", phase2Schema, (data) => {
        assert.equal(data.pulse, 93513);
        assert.equal(data.relativePulse, 500);
        assert.equal(data.consumption, 8);
        assert.equal(data.consumptionCumulative, 1496.208);
      });

      expectSample("phase3", phase1Schema, (data) => {
        assert.equal(data.pulse, 84685);
        assert.equal(data.relativePulse, 200);
        assert.equal(data.consumption, 2.4);
        assert.equal(data.consumptionCumulative, 1016.22);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse1, 23633);
        assert.equal(value.lastPulse2, 93513);
        assert.equal(value.lastPulse3, 84685);
      });

      consume(data);
    });

    it("should decode the Watecco Flash'O 1 Phase uplink & state init", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "110a000f04022300001226",
        },
      };

      expectSample("phase1", phase1Schema, (data) => {
        assert.equal(data.pulse, 4646);
        assert.equal(data.relativePulse, 0);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse1, 4646);
      });

      consume(data);
    });

    it("should decode the Watecco Flash'O 1 Phase uplink, with customfields and state", () => {
      const data = {
        device: {
          customFields: {
            pulseType1: "consumption",
            multiplier1: 15,
            divider1: 250,
          },
        },
        state: {
          lastPulse1: 4346,
        },
        data: {
          port: 125,
          payloadHex: "110a000f04022300001226",
        },
      };

      expectSample("phase1", phase1Schema, (data) => {
        assert.equal(data.pulse, 4646);
        assert.equal(data.consumption, 18);
        assert.equal(data.consumptionCumulative, 278.76);
        assert.equal(data.relativePulse, 300);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse1, 4646);
      });

      consume(data);
    });

    it("should decode the Watecco Flash'O lifecycle uplink, with customfields and state", () => {
      const data = {
        device: {
          customFields: {
            pulseType1: "consumption",
            multiplier1: 15,
            divider1: 250,
          },
        },
        state: {
          lastPulse1: 4646,
        },
        data: {
          port: 125,
          payloadHex: "110a00500006410501040e5404",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.668);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse1, 4646);
      });

      consume(data);
    });

    it("should decode the Watecco Flash'O Phase 3 uplink & state init", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "510a000f04022300000000",
        },
      };

      expectSample("phase3", phase3Schema, (data) => {
        assert.equal(data.pulse, 0);
        assert.equal(data.relativePulse, 0);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse3, 0);
      });

      consume(data);
    });
  });
});
