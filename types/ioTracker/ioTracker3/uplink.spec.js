const chai = require("chai");

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

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let gpsSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
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
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.uplinkReason, "BUTTON");
        assert.equal(value.data.crc, 0);
        assert.equal(value.data.batteryLevel, 98);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.temperature, 26.9);
         assert.equal(value.data.temperatureF, 80.4);
        assert.equal(value.data.light, 172.16);
        assert.equal(value.data.maxAccelerationNew, 16.384);
        assert.equal(value.data.maxAccelerationHistory, 16.384);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
      done();
    });

    it("should decode ioTracker 3 gps payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "1803fa0b0b0877ee00004000031c42d1d205162903143e1210001300091a07",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "gps");

        assert.equal(value.data.altitude, 518.2);
        assert.equal(value.data.cog, 0.9);
        assert.equal(value.data.hAcc, 18);
        assert.equal(value.data.hdop, 2.6);
        assert.equal(value.data.latitude, 47.4141138);
        assert.equal(value.data.longitude, 8.5338371);
        assert.equal(value.data.navStat, 3);
        assert.equal(value.data.numSvs, 7);
        assert.equal(value.data.sog, 1.9);
        assert.equal(value.data.vAcc, 16);

        utils.validateSchema(value.data, gpsSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.uplinkReason, "STATUS");
        assert.equal(value.data.crc, 3);
        assert.equal(value.data.batteryLevel, 98);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.light, 2598.4);
        assert.equal(value.data.maxAccelerationHistory, 16.384);
        assert.equal(value.data.maxAccelerationNew, 0);
        assert.equal(value.data.temperature, 28.24);
         assert.equal(value.data.temperatureF, 82.8);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
      done();
    });
  });
});
