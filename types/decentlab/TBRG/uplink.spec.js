import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab TRBG Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Decentlab TRBG payload", () => {
      const data = {
        data: {
          payloadHex: "0202f8000300040258409a00000c54",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.precipitation, 0.4);
        assert.equal(data.cumulativePrecipitation, 1653.8);
        assert.equal(data.precipitationInterval, 600);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.156);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceId, 760);
      });

      consume(data);
    });
  });
});
