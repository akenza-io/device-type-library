import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DLR2-002 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DLR2-002 payload", () => {
      const data = {
        data: {
          payloadHex:
            "02199e000300000258000000000c9b",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.cumulativePulseCount, 0);
        assert.equal(data.pulseInput, 0);
        assert.equal(data.pulseInterval, 600);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.227);
        assert.equal(data.deviceId, 6558);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});