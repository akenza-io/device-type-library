import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys ECO CO2 uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys ECO CO2 payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "010101022a040151060110070d84",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 25.7);
        assert.equal(data.humidity, 42);
        assert.equal(data.light, 337);
        assert.equal(data.co2, 272);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.46);
        assert.equal(data.batteryLevel, 80);
      });

      consume(data);
    });
  });
});
