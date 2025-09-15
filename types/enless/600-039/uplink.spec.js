const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Transmitter 600-039", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
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

  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/alarm.schema.json`)
      .then((parsedSchema) => {
        alarmSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the 600-039 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0000B40B0E1200000018000000280000005600070061",
        },
      };

      // --- Lifecycle ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 180);
        assert.equal(value.data.type, 11);
        assert.equal(value.data.seqCounter, 14);
        assert.equal(value.data.fwVersion, 18);
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default (state counters & input states) ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.pulseCh1Counter, 24);
        assert.equal(value.data.pulseCh2Counter, 40);
        assert.equal(value.data.pulseOcCounter, 86);
        assert.equal(value.data.pulseCh1State, "closed");
        assert.equal(value.data.pulseCh2State, "closed");
        assert.equal(value.data.pulseOcState, "open");
        assert.equal(value.data.msgType, "alarm");

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.ch1Alarm, true);
        assert.equal(value.data.ch2Alarm, true);
        assert.equal(value.data.ocAlarm, true);

        utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
