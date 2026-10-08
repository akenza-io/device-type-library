import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("TBWater leak uplink", () => {
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

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let systemSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/system.schema.json`)
      .then((parsedSchema) => {
        systemSchema = parsedSchema;
        done();
      });
  });

  let configSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/config.schema.json`)
      .then((parsedSchema) => {
        configSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode TBWater leak payload", () => {
      const data = {
        data: {
          port: 106,
          payloadHex: "000b3628",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.waterleak, false);
        assert.equal(value.data.temperature, 22);
        assert.equal(value.data.humidity, 40);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("Should decode TBWaterleak config payload", () => {
      const data = {
        data: {
          port: 204,
          payloadHex: "00100E01200230031E00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "config");
        assert.equal(value.data.keepaliveInterval, 3600);
        assert.equal(value.data.temperatureDelta, 32);
        assert.equal(value.data.humidityDelta, 48);
        assert.equal(value.data.sensorDetectionInterval, 30);

        validateSchema(value.data, configSchema, { throwError: true });
      });

      consume(data);
    });

    it("Should decode TBWaterleak system payload", () => {
      const data = {
        data: {
          port: 222,
          payloadHex: "0106000000001400007ff1f102e2d4f6ee",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.bootloader, "00000006");
        assert.equal(value.data.hwId, "00001400");
        assert.equal(value.data.crc, "02f1f17f");
        assert.equal(value.data.pupKeyId, "eef6d4e2");

        validateSchema(value.data, systemSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
