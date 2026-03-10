
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Transmitter 600-037", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    loadSchema(`${__dirname}/alarm.schema.json`)
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
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 160);
        assert.equal(value.data.type, 9);
        assert.equal(value.data.seqCounter, 13);
        assert.equal(value.data.fwVersion, 18);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default (pulse counters & states) ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.pulseCh1, 18);
        assert.equal(value.data.pulseCh2, 26);
        assert.equal(value.data.pulseOc, 24);
        assert.equal(value.data.pulseCh1State, "OPEN");
        assert.equal(value.data.pulseCh2State, "OPEN");
        assert.equal(value.data.pulseOcState, "OPEN");
        assert.equal(value.data.debounce1, false);
        assert.equal(value.data.debounce2, false);
        assert.equal(value.data.debounce3, false);
        assert.equal(value.data.msgType, "NORMAL");

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm (all false in this payload) ---
      expectEmits((type, value) => {
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

        validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
