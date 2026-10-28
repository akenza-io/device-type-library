import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino LSE01 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino LSE01 report uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "CE2900F107A5099B6E2890",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 24.1);
        assert.equal(data.soilHumidity, 19.57);
        assert.equal(data.soilTemperature, 24.59);
        assert.equal(data.soilConductivity, 28200);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.625);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
