import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys ELT Lite uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys ELT Lite payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100e20218070e410cff5614000edd20",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 22.6);
        assert.equal(data.humidity, 24);
        assert.equal(data.pressure, 974.112);
        assert.equal(data.externalTemperature1, -17);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.649);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
