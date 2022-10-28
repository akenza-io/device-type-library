const chai = require("chai");
const { validate } = require("jsonschema");
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

  describe("consume()", () => {
    /*
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

        assert.equal(value.topic, "default");
        assert.equal(value.data.soilHumidity, 0);
        assert.equal(value.data.soilTemperature, 23.2);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
    */
    // sk msID
    // 0000 0007 01 02 01
    // 0007 0064 00 1e 00
    // 0109 0000 00 11 00
    // 014f10000000004019

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
        assert.equal(value.data.detectionType, 0);
        assert.equal(value.data.modelId, 0);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
