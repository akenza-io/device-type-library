import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Transmitter 600-050", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
  let datalogSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  before((done) => {
    loadSchema(`${__dirname}/alarm.schema.json`).then((parsedSchema) => {
      alarmSchema = parsedSchema;
      done();
    });
  });

  before((done) => {
    loadSchema(`${__dirname}/datalog.schema.json`).then((parsedSchema) => {
      datalogSchema = parsedSchema;
      done();
    });
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
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "alarm");
        assert.equal(value.data.temperatureHigh, false);
        assert.equal(value.data.temperatureLow, false);
        assert.equal(value.data.humidityHigh, false);
        assert.equal(value.data.humidityLow, false);

        validateSchema(value.data, alarmSchema, { throwError: true });
      });

      // --- Default ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, -14.4);
        assert.equal(value.data.temperatureF, 6.1);
        assert.equal(value.data.humidity, 5);
        assert.equal(value.data.msgType, "NORMAL");
        assert.equal(value.data.rbe, false);

        validateSchema(value.data, defaultSchema, { throwError: true });
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
        assert.deepEqual(
          value.data.tempeartureDatalog,
          [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23],
        );
        assert.deepEqual(
          value.data.humidityDatalog,
          [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
        );

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
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "alarm");
        assert.equal(value.data.temperatureHigh, false);
        assert.equal(value.data.temperatureLow, false);
        assert.equal(value.data.humidityHigh, false);
        assert.equal(value.data.humidityLow, false);

        validateSchema(value.data, alarmSchema, { throwError: true });
      });

      // --- Default ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.msgType, "NORMAL");
        assert.equal(value.data.rbe, false);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
