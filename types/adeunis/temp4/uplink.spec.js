import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Adeunis TEMP", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Adeunis TEMP report uplink", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "579201B3FF9C01F4FFFF",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature1, 43.5);
        assert.equal(data.temperature2, -10);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.configurationDone, false);
        assert.equal(data.configurationInconsistency, false);
        assert.equal(data.frameCounter, 4);
        assert.equal(data.hasTimestamp, false);
        assert.equal(data.lowBattery, true);
        assert.equal(data.numSensors, 2);
      });

      consume(data);
    });
  });
});
