const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab ATM22 Uplink", () => {
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
    it("should decode the Decentlab ATM22 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0208c900038009812b8014810880027fe8800880040bf5",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 26.4);
        assert.equal(value.data.eastWindSpeed, 0.04);
        assert.equal(value.data.maximumWindSpeed, 0.2);
        assert.equal(value.data.northWindSpeed, 0.08);
        assert.equal(value.data.windDirection, 29.9);
        assert.equal(value.data.windSpeed, 0.09);
        assert.equal(value.data.xOrientationAngle, 0.2);
        assert.equal(value.data.yOrientationAngle, -2.4);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.061);
        assert.equal(value.data.deviceId, 2249);
        assert.equal(value.data.protocolVersion, 2);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});