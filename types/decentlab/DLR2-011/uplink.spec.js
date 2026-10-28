import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DLR2-011 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DLR2-011 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0243710007000100000af9",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.digitalInput0, 1);
        assert.equal(data.digitalInput1, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.809);
        assert.equal(data.deviceId, 17265);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});