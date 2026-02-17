import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Miromico insight enhanced Uplink", () => {
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
    it("should decode payload 1 with zero PM values", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "0401f208410302da01030f32400314330008180000000000000003096201",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.temperature, 22.9);
        assert.equal(value.data.humidity, 32.5);
        assert.equal(value.data.co2, 474);
        assert.equal(value.data.iaqIndex, 50);
        assert.equal(value.data.iaqAccuracy, 1);
        assert.equal(value.data.light, 51);
        assert.notProperty(value.data, "pm2_5");
        assert.notProperty(value.data, "pm1");
        assert.notProperty(value.data, "pm10");
        assert.notProperty(value.data, "pmObstructed");
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.54);
        assert.equal(value.data.batteryLevel, 85);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode payload 2 with different CO2 and light values", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "0401fa084103020902030f32400314290008180000000000000003096201",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.temperature, 22.98);
        assert.equal(value.data.humidity, 32.5);
        assert.equal(value.data.co2, 521);
        assert.equal(value.data.iaqIndex, 50);
        assert.equal(value.data.iaqAccuracy, 1);
        assert.equal(value.data.light, 41);
        assert.notProperty(value.data, "pm2_5");
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.54);
        assert.equal(value.data.batteryLevel, 85);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode payload 3 with higher temperature and CO2", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "040111094103022702030f32400314330008180000000000000003096101",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.temperature, 23.21);
        assert.equal(value.data.humidity, 32.5);
        assert.equal(value.data.co2, 551);
        assert.equal(value.data.iaqIndex, 50);
        assert.equal(value.data.iaqAccuracy, 1);
        assert.equal(value.data.light, 51);
        assert.notProperty(value.data, "pm2_5");
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.53);
        assert.equal(value.data.batteryLevel, 82);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode payload 4 with highest CO2 reading", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "04010b094103025e02030f32400314340008180000000000000003096001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.temperature, 23.15);
        assert.equal(value.data.humidity, 32.5);
        assert.equal(value.data.co2, 606);
        assert.equal(value.data.iaqIndex, 50);
        assert.equal(value.data.iaqAccuracy, 1);
        assert.equal(value.data.light, 52);
        assert.notProperty(value.data, "pm2_5");
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.52);
        assert.equal(value.data.batteryLevel, 80);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode payload 5 with different IAQ and humidity", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "04010a094003020f02030f46400314410008180000000000000003095e01",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.temperature, 23.14);
        assert.equal(value.data.humidity, 32);
        assert.equal(value.data.co2, 527);
        assert.equal(value.data.iaqIndex, 70);
        assert.equal(value.data.iaqAccuracy, 1);
        assert.equal(value.data.light, 65);
        assert.notProperty(value.data, "pm2_5");
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.5);
        assert.equal(value.data.batteryLevel, 75);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode payload 6 with non-zero PM values", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "0401f208410302da01030f32400314330008187d005300d2000003096201",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.temperature, 22.9);
        assert.equal(value.data.humidity, 32.5);
        assert.equal(value.data.co2, 474);
        assert.equal(value.data.iaqIndex, 50);
        assert.equal(value.data.iaqAccuracy, 1);
        assert.equal(value.data.light, 51);
        assert.equal(value.data.pm2_5, 12.5);
        assert.equal(value.data.pm1, 8.3);
        assert.equal(value.data.pm10, 21);
        assert.equal(value.data.pmObstructed, false);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.54);
        assert.equal(value.data.batteryLevel, 85);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should ignore payloads not on port 15", () => {
      const data = {
        data: {
          port: 3,
          payloadHex:
            "0401f208410302da01030f32400314330008180000000000000003096201",
        },
      };

      consume(data);
      // No emits expected
    });
  });
});
