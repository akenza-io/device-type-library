const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Transmitter 600-036", () => {
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
    it("should decode the 600-036 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "000095080C1200000020000000170000001E00000000",
        },
      };

      // --- Lifecycle ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 149);
        assert.equal(value.data.type, 8);
        assert.equal(value.data.seqCounter, 12);
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
        assert.equal(value.data.pulseCh1, 32);
        assert.equal(value.data.pulseCh2, 23);
        assert.equal(value.data.pulseOc, 30);
        assert.equal(value.data.pulseCh1State, "OPEN");
        assert.equal(value.data.pulseCh2State, "OPEN");
        assert.equal(value.data.pulseOcState, "OPEN");
        assert.equal(value.data.debounce1, false);
        assert.equal(value.data.debounce2, false);
        assert.equal(value.data.debounce3, false);
        assert.equal(value.data.msgType, "NORMAL");

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm (all false in this payload) ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.pulseCh1FlowHigh, false);
        assert.equal(value.data.pulseCh2FlowHigh, false);
        assert.equal(value.data.pulseOCFlowHigh, false);
        assert.equal(value.data.pulseCh1FlowLow, false);
        assert.equal(value.data.pulseCh2FlowLow, false);
        assert.equal(value.data.pulseOCFlowLow, false);
        assert.equal(value.data.pulseCh1Leak, false);
        assert.equal(value.data.pulseCh2Leak, false);
        assert.equal(value.data.pulseOCLeak, false);

        utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
