const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Watecco BoB Uplink", () => {
  let reportSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/report.schema.json`).then((parsedSchema) => {
      reportSchema = parsedSchema;
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
    it("should decode the Watecco BoB report uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "52087f5a00353e090019260c552a0000007c77ffffffffffffffff",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 97.638);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "report");
        assert.equal(value.data.anomalyLevel, 6.299);
        assert.equal(value.data.nrAlarms, 0);
        assert.equal(value.data.temperature, 23);
        assert.equal(value.data.operatingTime, 62);
        assert.equal(value.data.reportID, 9);
        assert.equal(value.data.maxAmplitude, 0.021);
        assert.equal(value.data.peakFrequencyIndex, 13);
        assert.equal(value.data.peakFrequency, 50.78125);
        assert.equal(value.data.goodVibration, 43.937);
        assert.equal(value.data.badVibrationPercentage1020, 12.089);
        assert.equal(value.data.badVibrationPercentage2040, 5.974);
        assert.equal(value.data.badVibrationPercentage4060, 0);
        assert.equal(value.data.badVibrationPercentage6080, 0);
        assert.equal(value.data.badVibrationPercentage80100, 0);
        assert.equal(value.data.anomalyLevelTo20Last24h, 119);
        assert.equal(value.data.anomalyLevelTo50Last24h, 255);
        assert.equal(value.data.anomalyLevelTo80Last24h, 255);
        assert.equal(value.data.anomalyLevelTo20Last30d, 255);
        assert.equal(value.data.anomalyLevelTo50Last30d, 255);
        assert.equal(value.data.anomalyLevelTo80Last30d, 255);
        assert.equal(value.data.anomalyLevelTo20Last6m, 255);
        assert.equal(value.data.anomalyLevelTo50Last6m, 255);
        assert.equal(value.data.anomalyLevelTo80Last6m, 255);
        utils.validateSchema(value.data, reportSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
