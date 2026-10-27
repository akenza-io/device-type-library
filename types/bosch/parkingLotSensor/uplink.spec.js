import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Bosch Parking Lot Sensor Uplink", () => {
  let occupancySchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Bosch Parking Lot Sensor payload && state init", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "01",
        },
        state: {}
      };


      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.exists(value.firstOccupancyTimestamp);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupancy, 1);
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.occupancyStatus, "OCCUPIED");
      });

      consume(data);
    });

    it("should decode the Bosch Parking Lot Sensor payload and start the minutesSinceLastOccupied timer", () => {
      const data = {
        state: {
          firstOccupancyTimestamp: new Date().getTime() - 10 * 60 * 1000
        },
        data: {
          port: 2,
          payloadHex: "00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.exists(value.lastOccupancyTimestamp);
        assert.equal(value.occupiedMinutes, 10);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupancy, 0);
        assert.equal(data.occupied, false);
        assert.equal(data.warm, true);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.occupancyStatus, "WARM");
      });

      consume(data);
    });


    it("should decode the Bosch Parking Lot Sensor payload and delete the minutesSinceLastOccupied time", () => {
      const data = {
        state: {
          lastOccupancyTimestamp: new Date().setMinutes(new Date().getMinutes() - 20),
          occupiedMinutes: 10
        },
        data: {
          port: 2,
          payloadHex: "01",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.firstOccupancyTimestamp);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupancy, 1);
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.warm, false);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.occupancyStatus, "OCCUPIED");
      });

      consume(data);
    });

    it("should decode the Bosch Parking Lot Sensor payload and get occupancy time", () => {
      const data = {
        state: {
          firstOccupancyTimestamp: new Date().setMinutes(new Date().getMinutes() - 20)
        },
        data: {
          port: 2,
          payloadHex: "01",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.firstOccupancyTimestamp);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupancy, 1);
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedMinutes, 20);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.warm, false);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.occupancyStatus, "OCCUPIED");
      });

      consume(data);
    });

  });
});
