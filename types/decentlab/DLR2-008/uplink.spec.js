import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DLR2-008 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DLR2-008 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0207df000317de008d0c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 20.031064968287208);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.deviceId, 2015);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});