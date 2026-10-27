import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys CO2 lite uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys CO2 lite payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100f4022804000b0601d8070e3e",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.light, 11);
        assert.equal(data.humidity, 40);
        assert.equal(data.temperature, 24.4);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.646);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
