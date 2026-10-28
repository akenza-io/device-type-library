import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Dragino SW3L Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino SW3L report uplink", () => {
      const data = {
        device: {
          customFields: {
            transformation: 12,
          },
        },
        data: {
          payloadHex: "01000000c3000166ec3c7e",
          port: 2,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value.lastPulse, 195);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.alarm, false);
        assert.equal(data.calculateFlag, 0);
        assert.equal(data.relativePulse, 0);
        assert.equal(data.totalPulse, 195);
        assert.equal(data.currentWaterConsumption, 0);
        assert.equal(data.totalWaterConsumption, 16.3);
      });

      consume(data);
    });

    it("should decode the Dragino SW3L report uplink", () => {
      const data = {
        state: {
          lastPulse: 120,
        },
        data: {
          payloadHex: "01000000c3000166ec3c7e",
          port: 2,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value.lastPulse, 195);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.alarm, false);
        assert.equal(data.calculateFlag, 0);
        assert.equal(data.relativePulse, 75);
        assert.equal(data.totalPulse, 195);
        assert.equal(data.currentWaterConsumption, 0.2);
        assert.equal(data.totalWaterConsumption, 0.4);
      });

      consume(data);
    });
  });
});
