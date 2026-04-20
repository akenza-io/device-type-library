

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Wika Netris2 Uplink", () => {
  let defaultSchema = null;
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

  let deviceInformationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/device_information.schema.json`)
      .then((parsedSchema) => {
        deviceInformationSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let processAlarmSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/process_alarm.schema.json`)
      .then((parsedSchema) => {
        processAlarmSchema = parsedSchema;
        done();
      });
  });

  let technicalAlarmSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/technical_alarm.schema.json`)
      .then((parsedSchema) => {
        technicalAlarmSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Wika Netris1 standard uplink", () => {
      const data = {
        device: {
          customFields: {
            pressureMin: 0,
            pressureMax: 25,
          }
        },
        data: {
          port: 1,
          payloadHex:
            "02000308D31F90",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.channel1, -0.6025);
        assert.equal(value.data.channel2, 13.950000000000001);
        assert.equal(value.data.delta, -14.552500000000002);
        assert.equal(value.data.deltaReverse, 14.552500000000002);

        //validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Netris 1 process alarm uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "030100052CA80926B8",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channelId, 1);
        assert.equal(value.data.alarmStatus, "STARTED");
        assert.equal(value.data.alarmType, "HIGH_THRESHOLD_WITH_DELAY");
        assert.equal(value.data.value, 22.330000000000002);

        // validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channelId, 2);
        assert.equal(value.data.alarmStatus, "STARTED");
        assert.equal(value.data.alarmType, "HIGH_THRESHOLD");
        assert.equal(value.data.value, 18.53);

        // validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });


    it("should decode the Wika Netris 1 technical alarm uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0400030201",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channelId, 1);
        assert.equal(value.data.alarmStatus, "STARTED");
        assert.equal(value.data.alarmType, "SHORT_CONDITION");

        // validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channelId, 2);
        assert.equal(value.data.alarmStatus, "STARTED");
        assert.equal(value.data.alarmType, "OPEN_CONDITION");

        // validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });


    it("should decode the Wika Netris 1 configuration uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "060120",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "configuration");
        assert.equal(value.data.status, "CONFIGURATION_SUCCESS");

        // validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });


    it("should decode the Wika Netris 1 lifecycle uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "080C0000001300000020631A",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 99);
        assert.equal(value.data.internalTemperature, 26);
        assert.equal(value.data.nrOfSamples, 19);
        assert.equal(value.data.nrOfTransmissions, 32);

        // validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
