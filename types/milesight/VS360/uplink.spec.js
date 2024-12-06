const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Milesight VS360 Uplink", () => {
  let peopleFlowSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/people_flow.schema.json`)
      .then((parsedSchema) => {
        peopleFlowSchema = parsedSchema;
        done();
      });
  });

  let eventSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/event.schema.json`)
      .then((parsedSchema) => {
        eventSchema = parsedSchema;
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
    it("should decode should decode the Milesight VS360 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "84CC011108110185CCE803E90301",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "people_flow");
        assert.equal(value.data.periodicCountAlarm, "THRESHOLD_ALARM");
        assert.equal(value.data.periodicCountIn, 1000);
        assert.equal(value.data.periodicCountOut, 1001);
        assert.equal(value.data.totalCountAlarm, "THRESHOLD_ALARM");
        assert.equal(value.data.totalCountIn, 4353);
        assert.equal(value.data.totalCountOut, 4360);

        utils.validateSchema(value.data, peopleFlowSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode should decode the Milesight VS350 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "03F4000103F4000003F4010103F40201",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.status, "ALARM");
        assert.equal(value.data.type, 'COUNTING_ANOMALY');

        utils.validateSchema(value.data, eventSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.status, "ALARM_RELEASE");
        assert.equal(value.data.type, 'COUNTING_ANOMALY');

        utils.validateSchema(value.data, eventSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.status, "ALARM");
        assert.equal(value.data.type, 'NODE_DEVICE_WITHOUT_RESPONSE');

        utils.validateSchema(value.data, eventSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.status, "ALARM");
        assert.equal(value.data.type, 'DEVICES_MISALIGNED');

        utils.validateSchema(value.data, eventSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
