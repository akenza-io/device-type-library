const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Seeed SenseCAP A1101 Vision Sensor Uplink", () => {
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

  describe("consume()", () => {
    it("should decode Seeed SenseCAP Vision Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "014f10fe010000f59a",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.objectDetected1, 0.51);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Seeed SenseCAP Vision Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0000000701020100070064001e0001090000001100014f10000000004019",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.sendInterval, 1800);
        assert.equal(value.data.hardwareVersion, "1.2");
        assert.equal(value.data.softwareVersion, "1.7");

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.objectDetected1, 0);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
