const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Meter Pulse uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/batteryVoltage.schema.json`)
      .then((parsedSchema) => {
        batteryVoltageSchema = parsedSchema;
        done();
      });
  });

  let internalTemperatureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/internalTemperature.schema.json`)
      .then((parsedSchema) => {
        internalTemperatureSchema = parsedSchema;
        done();
      });
  });

  let humiditySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/humidity.schema.json`)
      .then((parsedSchema) => {
        humiditySchema = parsedSchema;
        done();
      });
  });

  let periodicPulseCntSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/periodicPulseCnt.schema.json`)
      .then((parsedSchema) => {
        periodicPulseCntSchema = parsedSchema;
        done();
      });
  });

  let persistentPulseCntSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/persistentPulseCnt.schema.json`)
      .then((parsedSchema) => {
        persistentPulseCntSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Meter Pulse payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0206000008000112d40d000100e71000001f5c00070000025800d37669",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "batteryVoltage");
        assert.equal(value.data.batteryVoltage, 4820);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internalTemperature");
        assert.equal(value.data.internalTemperature, 23.1);

        utils.validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 31);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "periodicPulseCnt");
        assert.equal(value.data.periodicPulseCnt, 600);

        utils.validateSchema(value.data, periodicPulseCntSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "persistentPulseCnt");
        assert.equal(value.data.persistentPulseCnt, 13858409);

        utils.validateSchema(value.data, persistentPulseCntSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
