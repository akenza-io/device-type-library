import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yosensi YO H2O uplink", () => {
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

  let floodStateSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/flood_state.schema.json`).then((parsedSchema) => {
      floodStateSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO H2O payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0226000004000000410005ffc50030006f0800010d480d000100e21000001f",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 3400);

        validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 22.6);
        assert.equal(value.data.internalTemperatureF, 72.7);

        validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 31);

        validateSchema(value.data, humiditySchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "flood_state");
        assert.equal(value.data.floodState, 0);

        validateSchema(value.data, floodStateSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "accelerometer");
        assert.equal(value.data.accelerometerX, -5.9);
        assert.equal(value.data.accelerometerY, 4.8);
        assert.equal(value.data.accelerometerZ, 11.1);

        validateSchema(value.data, accelerometerSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
