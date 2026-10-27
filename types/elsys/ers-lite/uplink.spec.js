import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys ERS lite uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys ERS lite payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100f10217070e5a",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 23);
        assert.equal(data.temperature, 24.1);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.674);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
