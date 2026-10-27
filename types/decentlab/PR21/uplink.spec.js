import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab PR21 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Decentlab PR21 payload", () => {
      const data = {
        data: {
          payloadHex: "02016700034e8060170c7f",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.pressure, 0.24609375);
        assert.equal(data.temperature, 25.671875);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.199);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceId, 359);
      });

      consume(data);
    });
  });
});
