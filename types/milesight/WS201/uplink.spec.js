import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("WS201 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WS201 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403823E0004D645",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.distance, 62);
        assert.equal(data.remaining, 69);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);

      });

      consume(data);
    });
  });
});
