const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Transmitter 600-037", () => {
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
    it("should decode the 600-037 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0000A0090D12000000120000001A0000001800000000",
        },
      };

      // --- Lifecycle ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 160);
        assert.equal(value.data.type, 9);
        assert.equal(value.data.seqCounter, 13);
        assert.equal(value.data.fwVersion, 18);
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default (pulse counters & states) ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.pulseCh1, 18);
        assert.equal(value.data.pulseCh2, 26);
        assert.equal(value.data.pulseOc, 24);
        assert.equal(value.data.pulseCh1State, "open");
        assert.equal(value.data.pulseCh2State, "open");
        assert.equal(value.data.pulseOcState, "open");
        assert.equal(value.data.debounce1, false);
        assert.equal(value.data.debounce2, false);
        assert.equal(value.data.debounce3, false);
        assert.equal(value.data.msgType, "normal");

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm (all false in this payload) ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.pulse_ch1_flow_high, false);
        assert.equal(value.data.pulse_ch2_flow_high, false);
        assert.equal(value.data.pulse_oc_flow_high, false);
        assert.equal(value.data.pulse_ch1_flow_low, false);
        assert.equal(value.data.pulse_ch2_flow_low, false);
        assert.equal(value.data.pulse_oc_flow_low, false);
        assert.equal(value.data.pulse_ch1_leak, false);
        assert.equal(value.data.pulse_ch2_leak, false);
        assert.equal(value.data.pulse_oc_leak, false);

        utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
