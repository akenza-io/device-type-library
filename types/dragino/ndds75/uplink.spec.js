import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino NDDS75 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino NDDS75 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "f86778705021331700840cf41e010000396315537b",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.distance, 57);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.deviceId, "f867787050213317");
        assert.equal(data.interrupt, 0);
        assert.equal(data.mod, 1);
        assert.equal(data.signalStrength, 30);
        assert.equal(data.version, 132);
        assert.equal(data.batteryVoltage, 3.316);
        assert.equal(data.batteryLevel, 70);
      });

      consume(data);
    });
  });
});
