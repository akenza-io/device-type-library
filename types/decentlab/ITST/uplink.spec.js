import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab ITST Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab ITST payload", () => {
      const data = {
        data: {
          payloadHex:
            "0202d9000304f904c40c54",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperatureHead, 22);
        assert.equal(data.temperatureTarget, 27.3);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.156);
        assert.equal(data.deviceId, 729);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});