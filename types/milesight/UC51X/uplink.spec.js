import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("UC510 Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  let pressureSchema = null;
  let pulseSchema = null;
  let statusSchema = null;
  let ruleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    pressureSchema = loadSchema(`${import.meta.dirname}/pressure.schema.json`);
    pulseSchema = loadSchema(`${import.meta.dirname}/pulse.schema.json`);
    statusSchema = loadSchema(`${import.meta.dirname}/status.schema.json`);
    ruleSchema = loadSchema(`${import.meta.dirname}/rule.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the UC510 standard payload", () => {
      const data = {
        state: { lastPulse1: 1 },
        data: {
          port: 1,
          payloadHex: "01755C03010004C805000000",
        },
      };

      expectSample("pulse", pulseSchema, (data) => {
        assert.equal(data.pulse1, 5);
        assert.equal(data.relativePulse1, 4);
      });

      expectSample("status", statusSchema, (data) => {
        assert.equal(data.valve1, "CLOSED");
        assert.equal(data.valve1Open, false);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 92);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastPulse1, 5);
      });

      consume(data);
    });

    it("should decode should decode the UC510 standard payload", () => {
      const data = {
        device: {
          customFields: {
            pulseType1: "watt",
            multiplier1: 1.5,
          },
        },
        state: { lastPulse1: 1 },
        data: {
          port: 1,
          payloadHex: "01755C03010004C805000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pulse");
        assert.equal(value.data.pulse1, 5);
        assert.equal(value.data.relativePulse1, 4);
        assert.equal(value.data.watt, 6);
      });

      expectSample("status", statusSchema, (data) => {
        assert.equal(data.valve1, "CLOSED");
        assert.equal(data.valve1Open, false);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 92);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastPulse1, 5);
      });

      consume(data);
    });

    it("should decode should decode the UC510 standard payload", () => {
      const data = {
        state: {},
        data: {
          port: 1,
          payloadHex: "20CE3FA109641700000000",
        },
      };

      expectSample("status", statusSchema, (data) => {
        assert.equal(data.gpio2, "ON");
        assert.equal(data.valve2, "OPEN");
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
      });

      consume(data);
    });
  });
});
