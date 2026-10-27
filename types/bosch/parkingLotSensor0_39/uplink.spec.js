import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Bosch Parking Lot Sensor V0.39 Uplink", () => {
  let occupancySchema = null;
  let consume = null;
  let startUpSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
    startUpSchema = loadSchema(`${import.meta.dirname}/start_up.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Bosch Parking Lot Sensor payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.lastOccupancyTimestamp);
        assert.exists(value.occupiedMinutes);
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

    it("should decode the Bosch Parking Lot Sensor payload", () => {
      const data = {
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
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 1);
        assert.equal(data.occupancyStatus, "OCCUPIED");
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
      });

      consume(data);
    });

    it("should decode the Bosch Parking Lot Sensor start_up payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "0a000000970320cd000200000027020300",
        },
      };

      expectSample("start_up", startUpSchema, (data) => {
        assert.equal(data.debug, "0A000000970320CD0002");
        assert.equal(data.fwVersion, "0.39.2");
        assert.equal(data.resetCause, "SYSTEM_REQUEST_RESET");
      });

      consume(data);
    });
  });
});
