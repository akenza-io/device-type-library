import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("EM400-ULD Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the EM400-ULD payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01755C0367010104824408050001",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 92);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 25.7);
        assert.equal(data.distance, 2116);
        assert.equal(data.tilt, true);
      });

      consume(data);
    });
  });
});
