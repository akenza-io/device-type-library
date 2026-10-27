import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Alevel V2 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Alevel V2 payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "81AFFBD1E158",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.sequenceNumber, 175);
        assert.equal(data.batteryStatus, "HEALTHY");
        assert.equal(data.currentProfile, "IMR_LORA_SIGFOX");
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, -5);
        assert.equal(data.buttonLatched, false);
        assert.equal(data.isButtonPressed, true);
        assert.equal(data.currentLevel, 90.1);
        assert.equal(data.removedFromDial, false);
        assert.equal(data.isRefilling, true);
        assert.equal(data.highLPG, true);
        assert.equal(data.lowLPG, false);
        assert.equal(data.outOfRange, false);
        assert.equal(data.notValidReadout, false);
      });

      consume(data);
    });
  });
});
