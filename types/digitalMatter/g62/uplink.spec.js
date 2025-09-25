const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital matter G62 Uplink", () => {
  let gpsSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
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

  let digitalSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/digital.schema.json`)
      .then((parsedSchema) => {
        digitalSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the digital matter G62 payload, port 1", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "AA26F5EC16A108450A12CAC9330000171C",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.tripType, "MOVEMENT");
        assert.equal(value.data.latitude, -31.9478112);
        assert.equal(value.data.longitude, 115.8193424);
        assert.equal(value.data.gpsFixCurrent, true);
        assert.equal(value.data.headingDeg, 20);
        assert.equal(value.data.speedKmph, 18);

        utils.validateSchema(value.data, gpsSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital");

        assert.equal(value.data.extPower, false);
        assert.equal(value.data.ignition, false);
        assert.equal(value.data.digitalInput1, true);
        assert.equal(value.data.digitalInput2, true);
        assert.equal(value.data.digitalOutput, false);
        assert.equal(value.data.extVoltage, 13.257);
        assert.equal(value.data.analogInput, 0);

        utils.validateSchema(value.data, digitalSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 4.04);
        assert.equal(value.data.internalTemperature, 23);
         assert.equal(value.data.internalTemperatureF, 73.4);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
