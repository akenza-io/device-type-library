import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yosensi YO 360 uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/battery_voltage.schema.json`).then(
      (parsedSchema) => {
        batteryVoltageSchema = parsedSchema;
        done();
      },
    );
  });

  let internalTemperatureSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/internal_temperature.schema.json`).then(
      (parsedSchema) => {
        internalTemperatureSchema = parsedSchema;
        done();
      },
    );
  });

  let humiditySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/humidity.schema.json`).then((parsedSchema) => {
      humiditySchema = parsedSchema;
      done();
    });
  });

  let accelerometerSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/accelerometer.schema.json`).then(
      (parsedSchema) => {
        accelerometerSchema = parsedSchema;
        done();
      },
    );
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO 360 payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "020000000800010b620d000100f61000002f41001519fff9001e005b",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 2914);

        validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 24.6);
        assert.equal(value.data.internalTemperatureF, 76.3);

        validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 47);

        validateSchema(value.data, humiditySchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "accelerometer");
        assert.equal(value.data.accelerometerX, -0.7);
        assert.equal(value.data.accelerometerY, 3);
        assert.equal(value.data.accelerometerZ, 9.1);

        validateSchema(value.data, accelerometerSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
