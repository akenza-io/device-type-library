const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab LID Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    done();
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
    it("should decode the Decentlab LID payload", () => {
      const data = {
        data: {
          payloadHex:
            "0211c90003119b117611bc119e118a119411a811a81194006401990abd",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.distance10thPercentile, 4490);
        assert.equal(value.data.distance25thPercentile, 4500);
        assert.equal(value.data.distance75thPercentile, 4520);
        assert.equal(value.data.distance90thPercentile, 4520);
        assert.equal(value.data.distanceAverage, 4507);
        assert.equal(value.data.distanceMaximum, 4540);
        assert.equal(value.data.distanceMedian, 4510);
        assert.equal(value.data.distanceMinimum, 4470);
        assert.equal(value.data.distanceMostFrequentValue, 4500);
        assert.equal(value.data.numberOfSamples, 100);
        assert.equal(value.data.totalAcquisitionTime, 399.4140625);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.749);
        assert.equal(value.data.deviceId, 4553);
        assert.equal(value.data.protocolVersion, 2);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});