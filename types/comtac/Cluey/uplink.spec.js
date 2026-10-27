import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Comtac Cluey Uplink", () => {
  let digitalInputsSchema = null;
  let consume = null;
  let eventSchema = null;
  let lifecycleSchema = null;
  let pointInfoSchema = null;
  let analogInput5Schema = null;
  let analogInput6Schema = null;
  let analogInput7Schema = null;
  let analogInput8Schema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    digitalInputsSchema = loadSchema(`${import.meta.dirname}/digital_inputs.schema.json`);
    eventSchema = loadSchema(`${import.meta.dirname}/event.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    pointInfoSchema = loadSchema(`${import.meta.dirname}/point_info.schema.json`);
    analogInput5Schema = loadSchema(`${import.meta.dirname}/analog_input_5.schema.json`);
    analogInput6Schema = loadSchema(`${import.meta.dirname}/analog_input_6.schema.json`);
    analogInput7Schema = loadSchema(`${import.meta.dirname}/analog_input_7.schema.json`);
    analogInput8Schema = loadSchema(`${import.meta.dirname}/analog_input_8.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Comtac Cluey AI_DATA payload", () => {
      const data = {
        data: {
          port: 23,
          payloadHex: "1103040163d033a755801ee30000568900000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      expectSample("analog_input_5", analogInput5Schema, (data) => {
        assert.equal(data.cyclic, true);
        assert.equal(data.event, false);
        assert.equal(data.interrogation, false);
        assert.equal(data.invalid, false);
        assert.equal(data.limit, false);
        assert.equal(data.limit1, false);
        assert.equal(data.limit2, false);
        assert.equal(data.overflow, false);
        assert.equal(data.value, 7907);
      });

      expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      expectSample("analog_input_6", analogInput6Schema, (data) => {
        assert.equal(data.cyclic, true);
        assert.equal(data.event, false);
        assert.equal(data.interrogation, false);
        assert.equal(data.invalid, true);
        assert.equal(data.limit, false);
        assert.equal(data.limit1, true);
        assert.equal(data.limit2, false);
        assert.equal(data.overflow, false);
        assert.equal(data.value, 0);
      });

      expectSample("event", eventSchema, (data) => {
        assert.equal(data.eventType, "AI_DATA");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryPowered, false);
        assert.equal(data.bufferOverflow, false);
        assert.equal(data.configurationError, false);
        assert.equal(data.confirmationTimeout, false);
        assert.equal(data.deviceRestarted, false);
        assert.equal(data.lowSupplyVoltage, false);
        assert.equal(data.timeSynced, true);
        assert.equal(data.txCreditsConsumed, false);
      });

      consume(data);
    });

    it("should decode the Comtac Cluey point_info payload", () => {
      const data = {
        data: {
          port: 20,
          payloadHex:
            "100128df5fee66011141000012410000134100001441000015410000164100001741000018410000",
        },
      };
      const script = rewire(`${import.meta.dirname}/uplink.js`);
      consume = init(script);

      expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      expectSample("point_info", pointInfoSchema, (data) => {
        assert.equal(data.blocked, false);
        assert.equal(data.cyclic, false);
        assert.equal(data.event, false);
        assert.equal(data.id, 1);
        assert.equal(data.interrogation, true);
        assert.equal(data.limit, false);
        assert.equal(data.type, "SINGLE_POINT_INFO");
      });

      expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      expectSample("point_info", pointInfoSchema, (data) => {
        assert.equal(data.blocked, false);
        assert.equal(data.cyclic, false);
        assert.equal(data.event, false);
        assert.equal(data.id, 2);
        assert.equal(data.interrogation, true);
        assert.equal(data.limit, false);
        assert.equal(data.type, "SINGLE_POINT_INFO");
      });

      expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      expectSample("point_info", pointInfoSchema, (data) => {
        assert.equal(data.blocked, false);
        assert.equal(data.cyclic, false);
        assert.equal(data.event, false);
        assert.equal(data.id, 3);
        assert.equal(data.interrogation, true);
        assert.equal(data.limit, false);
        assert.equal(data.type, "SINGLE_POINT_INFO");
      });

      expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      expectSample("point_info", pointInfoSchema, (data) => {
        assert.equal(data.blocked, false);
        assert.equal(data.cyclic, false);
        assert.equal(data.event, false);
        assert.equal(data.id, 4);
        assert.equal(data.interrogation, true);
        assert.equal(data.limit, false);
        assert.equal(data.type, "SINGLE_POINT_INFO");
      });

      expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      expectSample("point_info", pointInfoSchema, (data) => {
        assert.equal(data.blocked, false);
        assert.equal(data.cyclic, false);
        assert.equal(data.event, false);
        assert.equal(data.id, 5);
        assert.equal(data.interrogation, true);
        assert.equal(data.limit, false);
        assert.equal(data.type, "SINGLE_POINT_INFO");
      });

      expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      expectSample("point_info", pointInfoSchema, (data) => {
        assert.equal(data.blocked, false);
        assert.equal(data.cyclic, false);
        assert.equal(data.event, false);
        assert.equal(data.id, 6);
        assert.equal(data.interrogation, true);
        assert.equal(data.limit, false);
        assert.equal(data.type, "SINGLE_POINT_INFO");
      });

      expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      expectSample("point_info", pointInfoSchema, (data) => {
        assert.equal(data.blocked, false);
        assert.equal(data.cyclic, false);
        assert.equal(data.event, false);
        assert.equal(data.id, 7);
        assert.equal(data.interrogation, true);
        assert.equal(data.limit, false);
        assert.equal(data.type, "SINGLE_POINT_INFO");
      });

      expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      expectSample("point_info", pointInfoSchema, (data) => {
        assert.equal(data.blocked, false);
        assert.equal(data.cyclic, false);
        assert.equal(data.event, false);
        assert.equal(data.id, 8);
        assert.equal(data.interrogation, true);
        assert.equal(data.limit, false);
        assert.equal(data.type, "SINGLE_POINT_INFO");
      });

      expectSample("event", eventSchema, (data) => {
        assert.equal(data.eventType, "DI_DATA");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 88);
        assert.equal(data.batteryPowered, true);
        assert.equal(data.bufferOverflow, false);
        assert.equal(data.configurationError, false);
        assert.equal(data.confirmationTimeout, false);
        assert.equal(data.deviceRestarted, true);
        assert.equal(data.lowSupplyVoltage, false);
        assert.equal(data.timeSynced, false);
        assert.equal(data.txCreditsConsumed, false);
      });

      consume(data);
    });

    it("should decode the Comtac Cluey interval data payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex:
            "110304bc64c2376680000300000000000000000000000000000000000000005588000000568800000057880000005888000000",
        },
      };
      const script = rewire(`${import.meta.dirname}/uplink.js`);
      consume = init(script);

      expectSample("digital_inputs", digitalInputsSchema, (data) => {
        assert.equal(data.cyclic, true);
        assert.equal(data.event, false);
        assert.equal(data.interrogation, false);
        assert.equal(data.limit, false);
        assert.equal(data.digitalInput1, true);
        assert.equal(data.digitalInput2, true);
        assert.equal(data.digitalInput3, false);
        assert.equal(data.digitalInput4, false);
        assert.equal(data.digitalInput5, false);
        assert.equal(data.digitalInput6, false);
        assert.equal(data.digitalInput7, false);
        assert.equal(data.digitalInput8, false);
        assert.equal(data.digitalInput9, false);
        assert.equal(data.digitalInput10, false);
        assert.equal(data.digitalInput11, false);
        assert.equal(data.digitalInput12, false);
        assert.equal(data.digitalInput13, false);
        assert.equal(data.digitalInput14, false);
        assert.equal(data.digitalInput15, false);
        assert.equal(data.digitalInput16, false);
      });

      expectSample("analog_input_5", analogInput5Schema, (data) => {
        assert.equal(data.cyclic, true);
        assert.equal(data.event, false);
        assert.equal(data.interrogation, false);
        assert.equal(data.invalid, true);
        assert.equal(data.limit, false);
        assert.equal(data.limit1, false);
        assert.equal(data.limit2, false);
        assert.equal(data.overflow, false);
        assert.equal(data.value, 0);
      });

      expectSample("analog_input_6", analogInput6Schema, (data) => {
        assert.equal(data.cyclic, true);
        assert.equal(data.event, false);
        assert.equal(data.interrogation, false);
        assert.equal(data.invalid, true);
        assert.equal(data.limit, false);
        assert.equal(data.limit1, false);
        assert.equal(data.limit2, false);
        assert.equal(data.overflow, false);
        assert.equal(data.value, 0);
      });

      expectSample("analog_input_7", analogInput7Schema, (data) => {
        assert.equal(data.cyclic, true);
        assert.equal(data.event, false);
        assert.equal(data.interrogation, false);
        assert.equal(data.invalid, true);
        assert.equal(data.limit, false);
        assert.equal(data.limit1, false);
        assert.equal(data.limit2, false);
        assert.equal(data.overflow, false);
        assert.equal(data.value, 0);
      });

      expectSample("analog_input_8", analogInput8Schema, (data) => {
        assert.equal(data.cyclic, true);
        assert.equal(data.event, false);
        assert.equal(data.interrogation, false);
        assert.equal(data.invalid, true);
        assert.equal(data.limit, false);
        assert.equal(data.limit1, false);
        assert.equal(data.limit2, false);
        assert.equal(data.overflow, false);
        assert.equal(data.value, 0);
      });

      expectSample("event", eventSchema, (data) => {
        assert.equal(data.eventType, "FIXED_DATA");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 74);
        assert.equal(data.batteryPowered, false);
        assert.equal(data.bufferOverflow, false);
        assert.equal(data.configurationError, false);
        assert.equal(data.confirmationTimeout, false);
        assert.equal(data.deviceRestarted, false);
        assert.equal(data.lowSupplyVoltage, false);
        assert.equal(data.timeSynced, true);
        assert.equal(data.txCreditsConsumed, false);
      });

      consume(data);
    });
  });
});
