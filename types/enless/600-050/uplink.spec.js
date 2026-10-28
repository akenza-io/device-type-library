
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";






describe("Transmitter 600-050", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
  let datalogSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    alarmSchema = loadSchema(`${import.meta.dirname}/alarm.schema.json`);
    datalogSchema = loadSchema(`${import.meta.dirname}/datalog.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the 600-050 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0000ea273612FF7000000032000000000000000000000000000000000000",
        },
      };

      // --- Lifecycle ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 234);
        assert.equal(value.data.type, 39);
        assert.equal(value.data.seqCounter, 54);
        assert.equal(value.data.fwVersion, 18);
        assert.equal(value.data.batteryLevel, 100); // bits 3-2 → 10

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Alarm ---
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.temperatureHigh, false);
        assert.equal(data.temperatureLow, false);
        assert.equal(data.humidityHigh, false);
        assert.equal(data.humidityLow, false);
      });

      // --- Default ---
      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, -14.4);
        assert.equal(data.humidity, 5);
        assert.equal(data.msgType, "NORMAL");
        assert.equal(data.rbe, false);
      });

      consume(data);
    });

    it("should decode the 600-050 datalogging payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0000ea2936110102030405060708090a0b0c0d0e0f10111213141516171800000000",
        },
      };

      // --- Default (datalogging values) ---
      expectEmits((type, value) => {
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

        validateSchema(value.data, datalogSchema, { throwError: true });
      });

      // --- Lifecycle ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 234);
        assert.equal(value.data.type, 41);
        assert.equal(value.data.seqCounter, 54);
        assert.equal(value.data.fwVersion, 17);
        assert.equal(value.data.batteryLevel, 100); // bits 3-2 → 00

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Alarm ---
      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.temperatureHigh, false);
        assert.equal(data.temperatureLow, false);
        assert.equal(data.humidityHigh, false);
        assert.equal(data.humidityLow, false);
      });

      // --- Default ---
      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.msgType, "NORMAL");
        assert.equal(data.rbe, false);
      });

      consume(data);
    });
  });
});
