const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("UC510 Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let pressureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/pressure.schema.json`)
      .then((parsedSchema) => {
        pressureSchema = parsedSchema;
        done();
      });
  });

  let pulseSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/pulse.schema.json`).then((parsedSchema) => {
      pulseSchema = parsedSchema;
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

  let ruleSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/rule.schema.json`).then((parsedSchema) => {
      ruleSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode should decode the UC510 standard payload", () => {
      const data = {
        state: { lastPulse1: 1 },
        data: {
          port: 1,
          payloadHex: "01755C03010004C805000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastPulse1, 5);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pulse");
        assert.equal(value.data.absolutePulse1, 5);
        assert.equal(value.data.pulse1, 4);
        utils.validateSchema(value.data, pulseSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.valve1, "CLOSED");
        utils.validateSchema(value.data, statusSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 92);
        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the UC510 standard payload", () => {
      const data = {
        device: {
          customFields: {
            pulseType1: "watt",
            multiplier1: 1.5,
          },
        },
        state: { lastPulse1: 1 },
        data: {
          port: 1,
          payloadHex: "01755C03010004C805000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastPulse1, 5);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pulse");
        assert.equal(value.data.absolutePulse1, 5);
        assert.equal(value.data.pulse1, 4);
        assert.equal(value.data.watt, 6);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.valve1, "CLOSED");
        utils.validateSchema(value.data, statusSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 92);
        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the UC510 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "20CE3FA109641700000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.gpio2, "ON");
        assert.equal(value.data.valve2, "OPEN");
        utils.validateSchema(value.data, statusSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
