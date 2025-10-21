import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Netvox R712 uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    [defaultSchema, lifecycleSchema] = await Promise.all([
      loadSchema(`${__dirname}/default.schema.json`),
      loadSchema(`${__dirname}/lifecycle.schema.json`),
    ]);
  });

  describe("consume()", () => {
    it("should decode the R712 data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "0101012406701A9E000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.batteryVoltage, 3.6);
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

    it("should decode the R712 version report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "0101019FFF391A9E010000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.batteryLevel, 17);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.temperature, -1.99);
        assert.equal(value.data.humidity, 68.14);
        assert.equal(value.data.lowTemperatureAlarm, true);
        assert.equal(value.data.highTemperatureAlarm, false);
        assert.equal(value.data.lowHumidityAlarm, false);
        assert.equal(value.data.highHumidityAlarm, false);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
