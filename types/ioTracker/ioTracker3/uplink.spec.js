const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("ioTracker 3 uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let gpsContentSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsContentSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode ioTracker 3 keepalive payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "1700fa0b0a82443440004000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.uplinkReason, "BUTTON");
        assert.equal(value.data.crc, 0);
        assert.equal(value.data.batteryLevel, 98);
        assert.equal(value.data.temperature, 26.9);
        assert.equal(value.data.light, 172.16);
        assert.equal(value.data.maxAccelerationNew, 16.384);
        assert.equal(value.data.maxAccelerationHistory, 16.384);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
      done();
    });

    it("should decode ioTracker 3 gps __get__ payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "1700fa0b0a82443440004000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.uplinkReason, "BUTTON");
        assert.equal(value.data.crc, 0);
        assert.equal(value.data.batteryLevel, 98);
        assert.equal(value.data.temperature, 26.9);
        assert.equal(value.data.light, 172.16);
        assert.equal(value.data.maxAccelerationNew, 16.384);
        assert.equal(value.data.maxAccelerationHistory, 16.384);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
      done();
    });
  });
});
