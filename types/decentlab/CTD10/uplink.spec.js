import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab CTD10 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab CTD10 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0207d9000390888081006400000c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.electricalConductivity, 100);
        assert.equal(data.freezingFlag, 0);
        assert.equal(data.temperature, 12.9);
        assert.equal(data.waterDepth, 4232);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.deviceId, 2009);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});