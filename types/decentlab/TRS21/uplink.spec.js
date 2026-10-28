import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab TRS21 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab TRS21 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0201920003007580a10c25",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.soilTemperature, 16.1);
        assert.equal(data.waterPotential, -11.7);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.109);
        assert.equal(data.deviceId, 402);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});