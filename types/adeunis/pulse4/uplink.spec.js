import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Adeunis Pulse", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Adeunis Pulse standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "5A6700000127000100020003000414ABA3E9",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.frameCounter, 3);
        assert.equal(data.hardwareError, false);
        assert.equal(data.lowBattery, true);
        assert.equal(data.configurationDone, true);
        assert.equal(data.timestamp, true);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.counterValue, 295);
        assert.equal(data.counterValueT1, 294);
        assert.equal(data.counterValueT2, 292);
        assert.equal(data.counterValueT3, 289);
        assert.equal(data.counterValueT4, 285);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "extra");
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the Adeunis Pulse config payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "100001000239012C57003C27107530000A0000000300050103060A0D",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.frameCounter, 0);
        assert.equal(data.hardwareError, false);
        assert.equal(data.lowBattery, false);
        assert.equal(data.configurationDone, false);
        assert.equal(data.timestamp, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "extra");
      });

      consume(data);
    });
  });
});
