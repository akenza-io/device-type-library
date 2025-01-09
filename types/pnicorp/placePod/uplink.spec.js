const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("PNIcorp place pod Uplink", () => {
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
    it("should decode the PNIcorp place pode Sensor payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "376600",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastOccupancyValue, false);
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
  });
});
