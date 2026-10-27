import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab MBX Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Decentlab MBX payload", () => {
      const data = {
        device: {
          customFields: {
            containerHeight: 200,
            installationOffset: 0,
          },
        },
        data: {
          payloadHex: "02012f000304d200010bb1",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.distance, 1234);
        assert.equal(data.distanceCm, 123.4);
        assert.equal(data.fillLevel, 38);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.993);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceId, 303);
        assert.equal(data.numberOfValidSamples, 1);
      });

      consume(data);
    });
  });
});
