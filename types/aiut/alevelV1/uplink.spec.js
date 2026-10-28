import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Alevel V1 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Alevel V1 payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "0746D8001700",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.66);
        assert.equal(data.batteryLevel, 0);
        assert.equal(data.deviceStatusFlag, 0);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.currentLevel, 2.9);
        assert.equal(data.isEmptying, false);
        assert.equal(data.isTanking, false);
        assert.equal(data.hasMeasurementError, false);
        assert.equal(data.hasOutOfRangeError, true);
        assert.equal(data.sequenceNumber, 2);
        assert.equal(data.temperature, 23);
      });

      consume(data);
    });
  });
});
