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

  let learningSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/learning.schema.json`)
      .then((parsedSchema) => {
        learningSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Watecco BoB learning uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "6c00001f3f013601407f5b4467393c303176301c332b61345b7e303e2318373f333f2231444a4245",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "learning");

        assert.equal(value.data.fft1, 0.013124353692099727);
        assert.equal(value.data.fft2, 0.026043639357760395);
        assert.equal(value.data.fft3, 0.0186611904059543);
        assert.equal(value.data.fft4, 0.013944625797855959);
        assert.equal(value.data.fft5, 0.021122006723222998);
        assert.equal(value.data.fft6, 0.011688877507026319);
        assert.equal(value.data.fft7, 0.012304081586343494);
        assert.equal(value.data.fft8, 0.009843265269074794);
        assert.equal(value.data.fft9, 0.010048333295513854);
        assert.equal(value.data.fft10, 0.02419802711980887);

        assert.equal(value.data.fft11, 0.009843265269074794);
        assert.equal(value.data.fft12, 0.005741904740293631);
        assert.equal(value.data.fft13, 0.01045846934839197);
        assert.equal(value.data.fft14, 0.008817925136879503);
        assert.equal(value.data.fft15, 0.019891598564588647);
        assert.equal(value.data.fft16, 0.010663537374831026);
        assert.equal(value.data.fft17, 0.0186611904059543);
        assert.equal(value.data.fft18, 0.025838571331321336);
        assert.equal(value.data.fft19, 0.009843265269074794);
        assert.equal(value.data.fft20, 0.01271421763922161);

        assert.equal(value.data.fft21, 0.007177380925367038);
        assert.equal(value.data.fft22, 0.004921632634537397);
        assert.equal(value.data.fft23, 0.011278741454148202);
        assert.equal(value.data.fft24, 0.012919285665660668);
        assert.equal(value.data.fft25, 0.01045846934839197);
        assert.equal(value.data.fft26, 0.012919285665660668);
        assert.equal(value.data.fft27, 0.006972312898927979);
        assert.equal(value.data.fft28, 0.010048333295513854);
        assert.equal(value.data.fft29, 0.013944625797855959);
        assert.equal(value.data.fft30, 0.015175033956490308);

        assert.equal(value.data.fft31, 0.013534489744977844);
        assert.equal(value.data.fft32, 0.014149693824295017);

        assert.equal(value.data.learningFrom, "ZERO");
        assert.equal(value.data.learningPercentage, 0);
        assert.equal(value.data.peakFrequency, 6.25);
        assert.equal(value.data.peakFrequencyIndex, 2);
        assert.equal(value.data.temperature, 24);
        assert.equal(value.data.vibrationLevel, 0.026043639357760395);

        utils.validateSchema(value.data, learningSchema, { throwError: true });
      });

      consume(data);
    });

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
