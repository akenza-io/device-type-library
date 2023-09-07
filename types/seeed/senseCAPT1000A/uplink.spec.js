const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Seeed SenseCAP T1000A Sensor Uplink", () => {
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

  let errorSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/error.schema.json`).then((parsedSchema) => {
      errorSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP T1000A Sensor gps payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "090000800064b909080082355b02d379e460",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 96);
        assert.equal(value.data.sosEvent, "NO_EVENT");

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.latitude, 47.413732);
        assert.equal(value.data.longitude, 8.533339);

        utils.validateSchema(value.data, gpsSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Seeed SenseCAP T1000A Sensor startup payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0260010a0105010002d0003c003c0001",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 96);
        assert.equal(value.data.eventInterval, 3600);
        assert.equal(value.data.firmwareVersion, "1.10");
        assert.equal(value.data.hardwareVersion, "1.5");
        assert.equal(value.data.heartbeatInterval, 43200);
        assert.equal(value.data.periodicInterval, 3600);
        assert.equal(value.data.sosMode, 1);
        assert.equal(value.data.workMode, 1);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Seeed SenseCAP T1000A Sensor empty payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0d00000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "error");
        assert.equal(value.data.error, "GNSS_SCAN_TIME_OUT");
        assert.equal(value.data.errorCode, 0);

        utils.validateSchema(value.data, errorSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
