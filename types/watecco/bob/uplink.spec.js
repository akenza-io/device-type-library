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
        assert.equal(value.data.operatingTime, 180);
        assert.equal(value.data.repID, 9);
        assert.equal(value.data.maxAmplitude, 0.021);
        assert.equal(value.data.peakFrequency, 13);
        assert.equal(value.data.min0_10, 127.559);
        assert.equal(value.data.min10_20, 35.098);
        assert.equal(value.data.min20_40, 17.343);
        assert.equal(value.data.min40_60, 0);
        assert.equal(value.data.min60_80, 0);
        assert.equal(value.data.min80_100, 0);
        assert.equal(value.data.anomalyLvL20Hours, 119);
        assert.equal(value.data.anomalyLvL50Hours, 255);
        assert.equal(value.data.anomalyLvL80Hours, 255);
        assert.equal(value.data.anomalyLvL20Days, 255);
        assert.equal(value.data.anomalyLvL50Days, 255);
        assert.equal(value.data.anomalyLvL80Days, 255);
        assert.equal(value.data.anomalyLvL20Months, 255);
        assert.equal(value.data.anomalyLvL50Months, 255);
        assert.equal(value.data.anomalyLvL80Months, 255);

        utils.validateSchema(value.data, reportSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
