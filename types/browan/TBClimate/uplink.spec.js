import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("TBClimate uplink", () => {
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
    it("should decode TBClimate payload", () => {
      const data = {
        data: {
          port: 103,
          payloadHex: "000b361d350200003c0035",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.open, false);
        assert.equal(value.data.temperature, 22);
        assert.equal(value.data.humidity, 29);
        assert.equal(value.data.co2, 565);
        assert.equal(value.data.voc, 0);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should skip empty payload", () => {
      const data = {
        data: {
          payloadHex: "",
        },
      };

      consume(data);
    });

    it("Should decode TBClimate config payload", () => {
      const data = {
        data: {
          port: 204,
          payloadHex: "00100e013c0002020305806b",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "config");
        assert.equal(value.data.keepaliveInterval, 3600);
        assert.equal(value.data.monitorTimeInterval, 60);
        assert.equal(value.data.temperatureTrigger, 2);
        assert.equal(value.data.humidityTrigger, 5);

        validateSchema(value.data, configSchema, { throwError: true });
      });

      consume(data);
    });

    it("Should decode TBClimate system payload", () => {
      const data = {
        data: {
          port: 222,
          payloadHex: "010600000000030000fdb3bd4de2d4f6ee",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.bootloader, "00000006");
        assert.equal(value.data.hwId, "00000300");
        assert.equal(value.data.crc, "4dbdb3fd");
        assert.equal(value.data.pupKeyId, "eef6d4e2");

        validateSchema(value.data, systemSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
