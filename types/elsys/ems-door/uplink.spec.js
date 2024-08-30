const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Elsys EMS Door uplink", () => {
  let reedSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/reed.schema.json`).then((parsedSchema) => {
      reedSchema = parsedSchema;
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
    it("should decode Elsys EMS Door payload", () => {
      const data = {
        state: {},
        data: {
          port: 5,
          payloadHex: "033e01ff070e2f0b000007920d010f00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reed");
        assert.equal(value.data.pulseAbs1, 1938);
        assert.equal(value.data.relativePulse1, 0);
        assert.equal(value.data.reed, true);

        utils.validateSchema(value.data, reedSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "acceleration");
        assert.equal(value.data.accMotion, 0);
        assert.equal(value.data.accX, 1);
        assert.equal(value.data.accY, 0);
        assert.equal(value.data.accZ, -0);

        utils.validateSchema(value.data, accelerationSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.batteryVoltage, 3.631);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastPulse1, 1938);
      });

      consume(data);
    });

    it("should decode Elsys EMS Door payload & give out lastpuls increment", () => {
      const data = {
        state: {
          lastPulse1: 1700,
        },
        data: {
          port: 5,
          payloadHex: "033e01ff070e2f0b000007920d010f00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reed");
        assert.equal(value.data.pulseAbs1, 1938);
        assert.equal(value.data.relativePulse1, 238);
        assert.equal(value.data.reed, true);

        utils.validateSchema(value.data, reedSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "acceleration");
        assert.equal(value.data.accMotion, 0);
        assert.equal(value.data.accX, 1);
        assert.equal(value.data.accY, 0);
        assert.equal(value.data.accZ, -0);

        utils.validateSchema(value.data, accelerationSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.batteryVoltage, 3.631);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastPulse1, 1938);
      });

      consume(data);
    });
  });
});
