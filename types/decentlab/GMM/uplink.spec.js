const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab GMM Uplink", () => {
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
    it("should decode the Decentlab GMM payload", () => {
      const data = {
        data: {
          payloadHex:
            "02532b00038726892081148297a57380cf81700bbc",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.humidity, 27.6);
        assert.equal(value.data.temperature, 23.36);
        assert.equal(value.data.pressure, 95.87);
        assert.equal(value.data.co2, 663);
        assert.equal(value.data.dewPoint, 3.68);
        assert.equal(value.data.photosyntheticallyActiveRadiation, 183);
        assert.equal(value.data.vaporPressureDeficit, 2.07);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.004);
        assert.equal(value.data.deviceId, 21291);
        assert.equal(value.data.protocolVersion, 2);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});