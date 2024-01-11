const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Tektelic Smart Room PIR Sensor Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

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

  let occupancySchema = null;
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
    it("should decode the Tektelic Smart Room PIR Sensor standart payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "036700f204686100ba0bc1",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.01);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 24.2);
        assert.equal(value.data.humidity, 48.5);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Tektelic Smart Room PIR Sensor occupancy payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "0a0000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.motion, 0);
        assert.equal(value.data.occupancy, 0);
        assert.equal(value.data.occupied, false);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Tektelic Smart Room PIR Sensor occupancy payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "0a00ff",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.motion, 1);
        assert.equal(value.data.occupancy, 1);
        assert.equal(value.data.occupied, true);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
