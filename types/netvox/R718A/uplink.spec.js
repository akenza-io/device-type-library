import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Netvox R718A uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let systemSchema = null;
  let consume = null;

  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    [defaultSchema, lifecycleSchema, systemSchema] = await Promise.all([
      loadSchema(`${__dirname}/default.schema.json`),
      loadSchema(`${__dirname}/lifecycle.schema.json`),
      loadSchema(`${__dirname}/system.schema.json`),
    ]);
  });

  describe("consume()", () => {
    it("should decode the R718A data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "010b012409981080000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, false);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.temperature, 24.56);
        assert.equal(value.data.humidity, 42.24);
        assert.equal(value.data.lowTemperatureAlarm, false);
        assert.equal(value.data.highTemperatureAlarm, false);
        assert.equal(value.data.lowHumidityAlarm, false);
        assert.equal(value.data.highHumidityAlarm, false);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the R718A version report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "010B012406701A9E000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, false);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.temperature, 16.48);
        assert.equal(value.data.humidity, 68.14);
        assert.equal(value.data.lowTemperatureAlarm, false);
        assert.equal(value.data.highTemperatureAlarm, false);
        assert.equal(value.data.lowHumidityAlarm, false);
        assert.equal(value.data.highHumidityAlarm, false);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
