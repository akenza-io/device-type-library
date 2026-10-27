import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys Eco uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys Eco payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100dc023b0400cf070df9",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.light, 207);
        assert.equal(data.humidity, 59);
        assert.equal(data.temperature, 22);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.577);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
