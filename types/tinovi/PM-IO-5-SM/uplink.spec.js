
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Tinovi PM-IO-5-SM Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Tinovi PM-IO-5-SM payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0163003400010d7f0000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.valve, false);
        assert.equal(data.leakDetected, false);
        assert.equal(data.e25, 0.52);
        assert.equal(data.soilConductivity, 0.1);
        assert.equal(data.temperature, 34.55);
        assert.equal(data.waterContent, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 99);
      });

      consume(data);
    });
  });
});
