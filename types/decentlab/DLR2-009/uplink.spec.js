import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DLR2-009 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DLR2-009 payload", () => {
      const data = {
        data: {
          payloadHex:
            "024c620003573400ad0ae1",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 24.908127512458456);
        assert.equal(data.thermistorResistance, 1097.0478279778865);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.785);
        assert.equal(data.deviceId, 19554);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});