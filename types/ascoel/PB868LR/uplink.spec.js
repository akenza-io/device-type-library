const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;
describe("Ascoel Push button Uplink", () => {
  let debugSchema = null;
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/debug.schema.json`).then((parsedSchema) => {
      debugSchema = parsedSchema;
      done();
    });
  });
  before((done) => {
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });
  describe("consume()", () => {
    it("should decode the Ascoel Push button firmware payload", () => {
      const data = {
        data: {
          port: 7,
          payloadHex: "010B0A4F04030F42",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "debug");
        assert.equal(value.data.firmwareVersion, "1.11.2639");
        assert.equal(value.data.hardwareRevision, "B");
        assert.equal(value.data.loraVersion, "4.3.15");

        utils.validateSchema(value.data, debugSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Ascoel Push button batteryLevel payload", () => {
      const data = {
        data: {
          port: 8,
          payloadHex: "5E",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 94);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Ascoel Push button button payload", () => {
      const data = {
        data: {
          port: 40,
          payloadHex: "010001",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.buttonPushed, true);
        assert.equal(value.data.count, 1);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
