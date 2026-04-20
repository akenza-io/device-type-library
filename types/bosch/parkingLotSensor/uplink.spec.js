

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Bosch Parking Lot Sensor Uplink", () => {
  let occupancySchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 1);
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.occupiedOrWarm, true);
        assert.equal(value.data.warm, false);
        assert.equal(value.data.minutesSinceLastOccupied, 0);
        assert.equal(value.data.occupiedMinutes, 0);
        assert.equal(value.data.occupancyStatus, "OCCUPIED");

        validateSchema(value.data, occupancySchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "occupancy");

        assert.equal(value.data.occupancy, 0);
        assert.equal(value.data.occupied, false);
        assert.equal(value.data.warm, true);
        assert.equal(value.data.occupiedOrWarm, true);
        assert.equal(value.data.minutesSinceLastOccupied, 0);
        assert.equal(value.data.occupiedMinutes, 0);
        assert.equal(value.data.occupancyStatus, "WARM");

        validateSchema(value.data, occupancySchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "occupancy");

        assert.equal(value.data.occupancy, 1);
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.occupiedMinutes, 0);
        assert.equal(value.data.minutesSinceLastOccupied, 0);
        assert.equal(value.data.warm, false);
        assert.equal(value.data.occupiedOrWarm, true);
        assert.equal(value.data.occupancyStatus, "OCCUPIED");

        validateSchema(value.data, occupancySchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "occupancy");

        assert.equal(value.data.occupancy, 1);
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.occupiedMinutes, 20);
        assert.equal(value.data.minutesSinceLastOccupied, 0);
        assert.equal(value.data.warm, false);
        assert.equal(value.data.occupiedOrWarm, true);
        assert.equal(value.data.occupancyStatus, "OCCUPIED");

        validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });

  });
});
