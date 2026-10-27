import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DLR2-006 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DLR2-006 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0211110003409a00860c54",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.potentiometerPosition, 0.04884648323059082);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.156);
        assert.equal(data.deviceId, 4369);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});