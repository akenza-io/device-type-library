import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("PNIcorp place pod Uplink", () => {
  let occupancySchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the PNIcorp place pode Sensor payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "376600",
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
  });
});
