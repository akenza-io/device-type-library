import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DLR2-010 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DLR2-010 payload", () => {
      const data = {
        data: {
          payloadHex:
            "02198f0007000402580bf0000100000258dece00000c33",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.cumulativePulseCount0, 68592);
        assert.equal(data.pulseInput0, 4);
        assert.equal(data.pulseInterval0, 600);
        assert.equal(data.cumulativePulseCount1, 57038);
        assert.equal(data.pulseInput1, 0);
        assert.equal(data.pulseInterval1, 600);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.123);
        assert.equal(data.deviceId, 6543);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});