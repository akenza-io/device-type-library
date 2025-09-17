const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Transmitter 600-051", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
  let datalogSchema = null;
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
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/datalog.schema.json`)
      .then((parsedSchema) => {
        datalogSchema = parsedSchema;
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
    it("should decode the 600-051 periodic payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0020041f000b00fe00000208000000000000000000000000000000000000",
        },
      };

      // --- Lifecycle ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 8196);
        assert.equal(value.data.type, 31);
        assert.equal(value.data.seqCounter, 0);
        assert.equal(value.data.fwVersion, 11);
        assert.equal(value.data.batteryLevel, 100); // bits 3-2 → 10

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 25.4);
        assert.equal(value.data.humidity, 52);
        assert.equal(value.data.msgType, "NORMAL");
        assert.equal(value.data.rbe, false);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "alarm");
        assert.equal(value.data.temperatureHigh, false);
        assert.equal(value.data.temperatureLow, false);
        assert.equal(value.data.humidityHigh, false);
        assert.equal(value.data.humidityLow, false);
        assert.equal(value.data.motionGuard, false);

        utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the 600-051 datalogging payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0000ea2936110102030405060708090a0b0c0d0e0f10111213141516171800000000",
        },
      };


      // --- Default (datalogging values) ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "datalog");

        // Vérifie quelques points dans la séquence
        assert.deepEqual(value.data.tempeartureDatalog, [
          1,
          3,
          5,
          7,
          9,
          11,
          13,
          15,
          17,
          19,
          21,
          23,
        ]);
        assert.deepEqual(value.data.humidityDatalog, [
          2,
          4,
          6,
          8,
          10,
          12,
          14,
          16,
          18,
          20,
          22,
          24,
        ]);

        utils.validateSchema(value.data, datalogSchema, { throwError: true });
      });

      // --- Lifecycle ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 234);
        assert.equal(value.data.type, 41);
        assert.equal(value.data.seqCounter, 54);
        assert.equal(value.data.fwVersion, 17);
        assert.equal(value.data.batteryLevel, 100); // bits 3-2 → 00

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default (datalogging values) ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");

        assert.equal(value.data.msgType, "NORMAL");
        assert.equal(value.data.rbe, false);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm (tous à false) ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "alarm");
        assert.equal(value.data.temperatureHigh, false);
        assert.equal(value.data.temperatureLow, false);
        assert.equal(value.data.humidityHigh, false);
        assert.equal(value.data.humidityLow, false);
        assert.equal(value.data.motionGuard, false);

        utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
