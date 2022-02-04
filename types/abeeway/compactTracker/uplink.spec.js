const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Abeeway compact tracker uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
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
    it("should decode Abeeway compact tracker GPS payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "03025c8200061c572f054ffb08",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.demandMessage, false);
        assert.equal(value.data.positionMessage, true);
        assert.equal(value.data.hasMoved, false);
        assert.equal(value.data.sos, false);
        assert.equal(value.data.operatingMode, "STANDBY");

        assert.equal(value.data.batteryLevel, 92);
        assert.equal(value.data.temperature, 21.8);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps_fix");
        assert.equal(value.data.longitude, 8.912768);
        assert.equal(value.data.latitude, 47.5475712);
        assert.equal(value.data.horizontalAccuracy, 31);
        assert.equal(value.data.age, 48);
        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
      done();
    });

    it("should decode Abeeway compact tracker heartbeat payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "05005c820040020200000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.demandMessage, false);
        assert.equal(value.data.positionMessage, true);
        assert.equal(value.data.hasMoved, false);
        assert.equal(value.data.sos, false);
        assert.equal(value.data.operatingMode, "STANDBY");

        assert.equal(value.data.batteryLevel, 92);
        assert.equal(value.data.temperature, 21.8);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps_fix");
        assert.equal(value.data.longitude, 8.912768);
        assert.equal(value.data.latitude, 47.5475712);
        assert.equal(value.data.horizontalAccuracy, 31);
        assert.equal(value.data.age, 48);
        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
      done();
    });
  });
});

// Winkelalarm 0a045c82000940000003e800000000fffe0048fc285a
// Ciritcal to Normal 0a045c83000960000003e80000000003ee0014001001
// Motionstate static 05005c820040020200000000
