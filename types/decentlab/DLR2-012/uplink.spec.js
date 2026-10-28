import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DLR2-012 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DLR2-012 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0217830003162e00870c33",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.strain, 1713.0065082323433);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.123);
        assert.equal(data.deviceId, 6019);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});