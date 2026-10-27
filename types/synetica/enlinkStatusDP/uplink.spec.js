import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Synetica Status DB Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Synetica Status DB report uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0100f6021a2c409724bd2d403390e6420ce9",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 24.6);
        assert.equal(data.humidity, 26);
        assert.equal(data.dp, 4.723);
        assert.equal(data.af, 2.806);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.305);
      });

      consume(data);
    });
  });
});
