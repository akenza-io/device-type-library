const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Adnexo ax-dist Uplink", () => {
  let measurementSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/measurement.schema.json`)
      .then((parsedSchema) => {
        measurementSchema = parsedSchema;
        done();
      });
  });

  let invalidMeasurementSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/invalid_measurement.schema.json`)
      .then((parsedSchema) => {
        invalidMeasurementSchema = parsedSchema;
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

  let statusSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/status.schema.json`).then((parsedSchema) => {
      statusSchema = parsedSchema;
      done();
    });
  });

  let errorSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/error.schema.json`).then((parsedSchema) => {
      errorSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Adnexo ax-dist measurement payload", () => {
      const data = {
        device: {
          customFields: {
            containerHeight: 600,
            installationOffset: 0,
          },
        },
        data: {
          port: 100,
          payloadHex: "340Adc008A0C",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.batteryVoltage, 3.21);
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "measurement");

        assert.equal(value.data.distance, 261.2);
        assert.equal(value.data.fillLevel, 56);
        assert.equal(value.data.measurementType, "REGULAR_MEASUREMENT");
        assert.equal(value.data.temperature, 22);

        utils.validateSchema(value.data, measurementSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode Adnexo ax-dist invalid measurement payload", () => {
      const data = {
        data: {
          port: 104,
          payloadHex: "340A7102dc008A0C",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "invalid_measurement");
        assert.equal(value.data.measurementVariance, 62.5);

        utils.validateSchema(value.data, invalidMeasurementSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode Adnexo ax-dist error payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "045802000005060600a30200",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "error");
        assert.equal(value.data.errorOn, "PARAM_READ");
        assert.equal(value.data.errorCode, "PARAM_NOT_READABLE");

        utils.validateSchema(value.data, errorSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Adnexo ax-dist config payload", () => {
      const data = {
        data: {
          port: 4,
          payloadHex: "045802000005060600a30200",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.joinInterval, 172800);
        assert.equal(value.data.measurementInterval, 600);
        assert.equal(value.data.payloadType, "REPORT_CONFIGURATION");
        assert.equal(value.data.sendInterval, 6);

        utils.validateSchema(value.data, statusSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
