import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("WT101 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WT101 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756104672C0103670A01059264099000000B900000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 26.6);
        assert.equal(data.targetTemperature, 30);
        assert.equal(data.valveOpening, 100);
        assert.equal(data.motorStroke, 0);
        assert.equal(data.motorPosition, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 97);
      });

      consume(data);
    });
  });
});
