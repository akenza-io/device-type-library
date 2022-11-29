const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Seeed SenseCAP 2103 CO2, Temperature and Humidity Sensor Uplink", () => {
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
    it("should decode Seeed SenseCAP2103 CO2, Temperature and Humidity Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010410404e0d00010110106300000102101ac20000facc",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 25.36);
        assert.equal(value.data.humidity, 49.69);
        assert.equal(value.data.co2, 872);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
