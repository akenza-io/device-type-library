import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Decentlab LP8P Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
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

  describe("consume()", () => {
    it("should decode the Decentlab LP8P payload", () => {
      const data = {
        data: {
          payloadHex:
            "020578000f67bd618d1cedbd1081d981f4895b0bd80bb50000959895390c25",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 24.36);
        assert.equal(value.data.temperatureF, 75.8);
        assert.equal(value.data.humidity, 41.63);
        assert.equal(value.data.barometricTemperature, 24.05);
        assert.equal(value.data.barometricTemperatureF, 75.3);
        assert.equal(value.data.pressure, 968);
        assert.equal(value.data.co2, 473);
        assert.equal(value.data.co2LPF, 500);
        assert.equal(value.data.co2Temperature, 23.95);
        assert.equal(value.data.co2TemperatureF, 75.1);
        assert.equal(value.data.capacitorVoltage1, 3.032);
        assert.equal(value.data.capacitorVoltage2, 2.997);
        assert.equal(value.data.rawIr, 38296);
        assert.equal(value.data.rawIrLPF, 38201);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.11);
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceID, 1400);
        assert.equal(value.data.co2SensorStatus, 0);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
