
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("Transmitter 600-037", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    alarmSchema = loadSchema(`${import.meta.dirname}/alarm.schema.json`);
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
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.id, 160);
        assert.equal(data.type, 9);
        assert.equal(data.seqCounter, 13);
        assert.equal(data.fwVersion, 18);
        assert.equal(data.batteryLevel, 100);
      });

      // --- Default (pulse counters & states) ---
      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.pulseCh1, 18);
        assert.equal(data.pulseCh2, 26);
        assert.equal(data.pulseOc, 24);
        assert.equal(data.pulseCh1State, "OPEN");
        assert.equal(data.pulseCh2State, "OPEN");
        assert.equal(data.pulseOcState, "OPEN");
        assert.equal(data.debounce1, false);
        assert.equal(data.debounce2, false);
        assert.equal(data.debounce3, false);
        assert.equal(data.msgType, "NORMAL");
      });

      // --- Alarm (all false in this payload) ---
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.pulseCh1FlowHigh, false);
        assert.equal(data.pulseCh2FlowHigh, false);
        assert.equal(data.pulseOCFlowHigh, false);
        assert.equal(data.pulseCh1FlowLow, false);
        assert.equal(data.pulseCh2FlowLow, false);
        assert.equal(data.pulseOCFlowLow, false);
        assert.equal(data.pulseCh1Leak, false);
        assert.equal(data.pulseCh2Leak, false);
        assert.equal(data.pulseOCLeak, false);
      });

      consume(data);
    });
  });
});
