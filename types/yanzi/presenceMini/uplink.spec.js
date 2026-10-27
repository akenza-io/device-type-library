import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Yanzi Presence Mini Sensor Uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  let occupancySchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Presence Mini Sensor Temperature payload", () => {
      const data = {
        data: {
          values: [
            {
              resourceType: "SampleTemp",
              sampleTime: 1643365120937,
              value: 292.405,
            },
          ],
        },
      };

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.temperature, 29.24);
      });

      consume(data);
    });

    it("should decode the Yanzi Presence Mini Sensor Motion payload", () => {
      const data = {
        state: {},
        data: {
          values: [
            {
              resourceType: "SampleMotion",
              sampleTime: 1643365120931,
              value: 24873,
              timeLastMotion: 1643365120931,
            },
          ],
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.lastOccupancyTimestamp);
        assert.exists(value.occupiedMinutes);
        assert.equal(value.lastMotion, 24873);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 0);
        assert.equal(data.occupancyStatus, "FREE");
        assert.equal(data.occupied, false);
        assert.equal(data.occupiedOrWarm, false);
        assert.equal(data.warm, false);
      });

      consume(data);
    });

    it("should decode the Yanzi Presence Mini Sensor Motion payload", () => {
      const data = {
        state: { lastMotion: 24800 },
        data: {
          values: [
            {
              resourceType: "SampleMotion",
              sampleTime: 1643365120931,
              value: 24873,
              timeLastMotion: 1643365120931,
            },
          ],
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.exists(value.firstOccupancyTimestamp);
        assert.equal(value.lastMotion, 24873);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 1);
        assert.equal(data.motion, 24873);
        assert.equal(data.occupancyStatus, "OCCUPIED");
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
      });


      consume(data);
    });
  });
});
