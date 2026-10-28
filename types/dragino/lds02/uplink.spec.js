import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino LDS02 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino LDS02 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "8c960100000200001200",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.alarm, false);
        assert.equal(data.open, true);
        assert.equal(data.openDuration, 18);
        assert.equal(data.openCounts, 2);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.2);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
