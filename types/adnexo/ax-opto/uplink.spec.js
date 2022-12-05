const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Adnexo ax-opto Uplink", () => {
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

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let accelerationSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/acceleration.schema.json`)
      .then((parsedSchema) => {
        accelerationSchema = parsedSchema;
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
    it("should decode Adnexo ax-opto measurement payload", () => {
      const data = {
        data: {
          port: 100,
          payloadHex: "c900c800c800c800b300b3000d010d011e021e0200001e00cb0a",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "measurement");

        assert.equal(value.data.bottomCenter, 54.2);
        assert.equal(value.data.bottomLeft, 26.9);
        assert.equal(value.data.bottomRight, 54.2);
        assert.equal(value.data.distance, 20.1);
        assert.equal(value.data.measurementType, "REGULAR_MEASUREMENT");
        assert.equal(value.data.middleCenter, 17.9);
        assert.equal(value.data.middleLeft, 17.9);
        assert.equal(value.data.middleRight, 26.9);
        assert.equal(value.data.temperature, 3);
        assert.equal(value.data.topCenter, 20);
        assert.equal(value.data.topLeft, 20);
        assert.equal(value.data.topRight, 20);
        assert.equal(value.data.voltage, 2.763);
        assert.equal(value.data.batteryLevel, 70);

        utils.validateSchema(value.data, measurementSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode Adnexo ax-opto acceleration payload", () => {
      const data = {
        data: {
          port: 99,
          payloadHex: "030052fc1501f80a",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "acceleration");
        assert.equal(value.data.xAxisAccelerometer, 3);
        assert.equal(value.data.yAxisAccelerometer, -942);
        assert.equal(value.data.zAxisAccelerometer, 277);

        utils.validateSchema(value.data, accelerationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode Adnexo ax-opto error payload", () => {
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

    it("should decode Adnexo ax-opto config payload", () => {
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

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.joinInterval, 172800);
        assert.equal(value.data.measurementInterval, 600);
        assert.equal(value.data.payloadType, "REPORT_CONFIGURATION");
        assert.equal(value.data.sendInterval, 6);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
