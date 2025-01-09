const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Bosch Parking Lot Sensor Uplink", () => {
  let occupancySchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/occupancy.schema.json`)
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
      };


      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastOccupiedValue, true);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 1);
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.minutesSinceLastOccupied, 0);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Bosch Parking Lot Sensor payload and start the minutesSinceLastOccupied timer", () => {
      const data = {
        state: {
          lastOccupiedValue: true
        },
        data: {
          port: 2,
          payloadHex: "00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastOccupiedValue, false);
        // assert.equal(value.lastOccupancyTimestamp, new Date().getTime());
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 0);
        assert.equal(value.data.occupied, false);
        assert.equal(value.data.minutesSinceLastOccupied, 0);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Bosch Parking Lot Sensor payload and get the minutesSinceLastOccupied time", () => {
      const data = {
        state: {
          lastOccupiedValue: true,
          lastOccupancyTimestamp: new Date().setMinutes(new Date().getMinutes() - 20)
        },
        data: {
          port: 2,
          payloadHex: "00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastOccupiedValue, false);
        // assert.equal(value.lastOccupancyTimestamp, new Date().setMinutes(new Date().getMinutes() - 20));
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 0);
        assert.equal(value.data.occupied, false);
        assert.equal(value.data.minutesSinceLastOccupied, 20);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Bosch Parking Lot Sensor payload and delete the minutesSinceLastOccupied time", () => {
      const data = {
        state: {
          lastOccupiedValue: true,
          lastOccupancyTimestamp: new Date().setMinutes(new Date().getMinutes() - 20)
        },
        data: {
          port: 2,
          payloadHex: "01",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastOccupiedValue, true);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 1);
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.minutesSinceLastOccupied, 0);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
