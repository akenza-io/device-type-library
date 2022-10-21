const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Seeed SenseCAP S2101 Air Temperature and Humidity Sensor Uplink", () => {
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
    it("should decode Seeed SenseCAP S2101 Air Temperature and Humidity Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010110B068000001021088F400008CFF",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.humidity, 62.6);
        assert.equal(value.data.temperature, 26.8);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
