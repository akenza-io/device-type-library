import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Elsys eye uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let occupancySchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys eye payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "05011101",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.firstOccupancyTimestamp);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 1);
        assert.equal(data.motion, 1);
        assert.equal(data.occupancyStatus, "OCCUPIED");
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
      });

      consume(data);
    });

    it("should decode elsys eye default + motion payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100e102280401a00500070dff1102",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 22.5);
        assert.equal(data.humidity, 40);
        assert.equal(data.light, 416);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.583);
        assert.equal(data.batteryLevel, 100);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.firstOccupancyTimestamp);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 2);
        assert.equal(data.motion, 0);
        assert.equal(data.occupancyStatus, "OCCUPIED");
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
      });

      consume(data);
    });
  });
});
