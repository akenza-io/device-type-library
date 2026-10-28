import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DLR2-005 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DLR2-005 payload", () => {
      const data = {
        data: {
          payloadHex:
            "02113a0003c55500d80c6d",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.voltage, 2.0805662870407104);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.181);
        assert.equal(data.deviceId, 4410);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});