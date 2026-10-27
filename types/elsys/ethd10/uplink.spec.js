import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys ETHD10 uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys ETHD10 payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100e9021d070e50",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 29);
        assert.equal(data.temperature, 23.3);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.664);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
