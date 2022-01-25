const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Humidity Sensor Uplink", () => {
  let humiditySchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/humidity.schema.json`)
      .then((parsedSchema) => {
        humiditySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Humidity Sensor payload", () => {
      const data = {
        data: {
          resourceType: "SampleHumidity",
          timeCreated: 1640185515602,
          sampleTime: 1640185515602,
          value: 30.5,
          temperature: 296.45,
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.temperature, 22.45);
        assert.equal(value.data.humidity, 17);

        validate(value.data, humiditySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
