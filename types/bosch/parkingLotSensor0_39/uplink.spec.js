const chai = require("chai");
const { validate } = require("jsonschema");
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

  let startUpSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/start_up.schema.json`)
      .then((parsedSchema) => {
        startUpSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Bosch Parking Lot Sensor payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 0);

        validate(value.data, occupancySchema, { throwError: true });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 1);
        validate(value.data, occupancySchema, { throwError: true });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "start_up");
        assert.equal(value.data.lastDebugCommand, "0A000000970320CD0002");
        assert.equal(value.data.fwVersion, "0.39.2");
        assert.equal(value.data.resetCause, "SYSTEM_REQUEST_RESET");

        validate(value.data, startUpSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
