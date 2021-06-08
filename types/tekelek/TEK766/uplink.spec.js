const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Tekelek TEK766 Uplink", () => {
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
  let measurementHistorySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/measurement_history.schema.json`)
      .then((parsedSchema) => {
        measurementHistorySchema = parsedSchema;
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
    it("should decode Tekelek TEK766 payload measurement + measurement_history", () => {
      const data = {
        data: {
          port: 1,
          payload_hex: "1000000001121B7701131BAA01121BA90114F274",
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "measurement");
        assert.equal(value.data.limit1Exceeded, false);
        assert.equal(value.data.limit2Exceeded, false);
        assert.equal(value.data.limit3Exceeded, false);
        assert.equal(value.data.ullage, 274);
        assert.equal(value.data.temperature, 27);
        assert.equal(value.data.src, 7);
        assert.equal(value.data.srssi, 7);

        validate(value.data, measurementSchema, { throwError: true });
      });
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "measurement_history");
        assert.equal(value.data.ullage1, 275);
        assert.equal(value.data.temperature1, 27);
        assert.equal(value.data.src1, 10);
        assert.equal(value.data.srssi1, 10);
        assert.equal(value.data.ullage2, 274);
        assert.equal(value.data.temperature2, 27);
        assert.equal(value.data.src2, 9);
        assert.equal(value.data.srssi2, 10);
        assert.equal(value.data.ullage3, 276);
        assert.equal(value.data.temperature3, -14);
        assert.equal(value.data.src3, 4);
        assert.equal(value.data.srssi3, 7);

        validate(value.data, measurementHistorySchema, { throwError: true });
      });
      consume(data);
    });
    it("should decode Tekelek TEK766 payload lifecycle", () => {
      const data = {
        data: {
          port: 1,
          payload_hex: "300000010106360063006300040600181BAA",
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.hardwareID, 1);
        assert.equal(value.data.fmVersion, "16");
        assert.equal(value.data.contactReason, "MANUAL");
        assert.equal(
          value.data.systemRequestReset,
          "CORTEX_M3_SYSTEM_REQUEST_RESET",
        );
        assert.equal(value.data.active, true);
        assert.equal(value.data.batteryLevel, 99);
        assert.equal(value.data.measurements, 4);
        assert.equal(value.data.transmitPeriods, 6);
        assert.equal(value.data.ullage, 24);
        assert.equal(value.data.temperature, 27);
        assert.equal(value.data.srssi, 10);
        assert.equal(value.data.src, 10);

        validate(value.data, lifecycleSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
