const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("pepperlFuchs wilsenSonicLevel uplink", () => {
  let consume = null;

  let defaultSchema = null;
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

  let locationSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/location.schema.json`)
      .then((parsedSchema) => {
        locationSchema = parsedSchema;
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

  // This is the test for default, copy this three times with different data hex to test it all
  describe("consume()", () => {
    it("should decode the default payload 1", () => {
      const data = {
        data: {
          payloadHex: "040B010041030B06590602014100000003510123",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.proximity, 65);
        assert.equal(value.data.fillinglvlPercent, 89);
        assert.equal(value.data.temperature, 8);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.voltage, 3.5);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the location payload 2", () => {
      const data = {
        data: {
          payloadHex:
            "040B010041030B06590602014101999A03510122065002007D217806500102F1C3DF",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.proximity, 65);
        assert.equal(value.data.fillinglvlPercent, 89);
        assert.equal(value.data.temperature, 8.1);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.voltage, 3.4);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "location");
        assert.equal(value.data.latitude, 49.398751);
        assert.equal(value.data.longitude, 8.200568);

        utils.validateSchema(value.data, locationSchema, { throwError: true });
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the lifecycle payload 3", () => {
      const data = {
        data: {
          payloadHex:
            "102A2534383030303030303632383738330431010701043102032206310300000F1C03510123",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.serialNumber, 1.0591369900271589e33);
        assert.equal(value.data.loraCount, 1793);
        assert.equal(value.data.gpsCount, 802);
        assert.equal(value.data.usSensorCount, 3868);
        assert.equal(value.data.voltage, 3.5);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
