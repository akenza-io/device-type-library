const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Moko LW007-PIR Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  let shutdownSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/shutdown.schema.json`)
      .then((parsedSchema) => {
        shutdownSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Moko LW007-PIR heartbeat payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex:
            "68A8359A101F8DE55F0000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.count, 0);
        assert.equal(value.data.humidity, 59.7);
        assert.equal(value.data.humidityState, "ENABLED");
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.pir, 0);
        assert.equal(value.data.pirState, "NO_MOTION");
        assert.equal(value.data.reed, false);
        assert.equal(value.data.reedState, "OPEN");
        assert.equal(value.data.reedStatus, "ENABLED");
        assert.equal(value.data.temperature, 26.7);
        assert.equal(value.data.temperatureState, "ENABLED");

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW007-PIR shutdown payload", () => {
      const data = {
        data: {
          port: 7,
          payloadHex:
            "68A838E81002",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "shutdown");
        assert.equal(value.data.lowBattery, false);

        utils.validateSchema(value.data, shutdownSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
