import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab KL66 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab KL66 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0203d400033bf67fff3bf60c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.counterReading, 15350);
        assert.equal(data.elongation, 0.6988257799379214);
        assert.equal(data.frequency, 15350.468459120457);
        assert.equal(data.measurementInterval, 0.999969482421875);
        assert.equal(data.strain, 10.588269392998809);
        assert.equal(data.weight, -47.5066896399347);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.deviceId, 980);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});