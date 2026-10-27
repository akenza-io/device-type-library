import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DLR2-003 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DLR2-003 payload", () => {
      const data = {
        data: {
          payloadHex:
            "02199b000300010c8d",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.digitalInput, 1);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.213);
        assert.equal(data.deviceId, 6555);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});