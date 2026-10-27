import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("WS202 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let occupancySchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WS202 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "017510030001040000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.firstOccupancyTimestamp);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 1);
        assert.equal(data.occupancyStatus, "OCCUPIED");
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 16);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.pir, 1);
        assert.equal(data.daylight, "DARK");
      });

      consume(data);
    });
  });
});
