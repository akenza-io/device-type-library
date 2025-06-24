const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Vegapulse Air 42", () => {
  let distanceSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/distance.schema.json`)
      .then((parsedSchema) => {
        distanceSchema = parsedSchema;
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

  let temperatureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
        temperatureSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Vegapulse Air payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "083FA31F152D2401042009",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "distance");
        assert.equal(value.data.distanceMm, 1274.3860483169556);
        assert.equal(value.data.distanceCm, 127.43860483169556);
        assert.equal(value.data.distanceM, 1.2743860483169556);
        assert.equal(value.data.distanceInch, 50.172679067596675);
        assert.equal(value.data.distanceFt, 4.181056588966389);
        assert.equal(value.data.sensorMeasurementUnit, "METERS");
        assert.equal(value.data.inclinationDegree, 9);

        utils.validateSchema(value.data, distanceSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 26);

        utils.validateSchema(value.data, temperatureSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 36);
        assert.equal(value.data.namurState, 'GOOD');

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
