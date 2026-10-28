import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab LID Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab LID payload", () => {
      const data = {
        data: {
          payloadHex:
            "0211c90003119b117611bc119e118a119411a811a81194006401990abd",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.distance10thPercentile, 4490);
        assert.equal(data.distance25thPercentile, 4500);
        assert.equal(data.distance75thPercentile, 4520);
        assert.equal(data.distance90thPercentile, 4520);
        assert.equal(data.distanceAverage, 4507);
        assert.equal(data.distanceMaximum, 4540);
        assert.equal(data.distanceMedian, 4510);
        assert.equal(data.distanceMinimum, 4470);
        assert.equal(data.distanceMostFrequentValue, 4500);
        assert.equal(data.numberOfSamples, 100);
        assert.equal(data.totalAcquisitionTime, 399.4140625);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.749);
        assert.equal(data.deviceId, 4553);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});