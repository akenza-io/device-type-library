import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("TBClimate uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let systemSchema = null;
  let configSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    configSchema = loadSchema(`${import.meta.dirname}/config.schema.json`);
  });

  describe("consume()", () => {
    it("should decode TBClimate payload", () => {
      const data = {
        data: {
          port: 103,
          payloadHex: "000b361d350200003c0035",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.open, false);
        assert.equal(data.temperature, 22);
        assert.equal(data.humidity, 29);
        assert.equal(data.co2, 565);
        assert.equal(data.voc, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.batteryLevel, 100);
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

      expectSample("config", configSchema, (data) => {
        assert.equal(data.keepaliveInterval, 3600);
        assert.equal(data.monitorTimeInterval, 60);
        assert.equal(data.temperatureTrigger, 2);
        assert.equal(data.humidityTrigger, 5);
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

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.bootloader, "00000006");
        assert.equal(data.hwId, "00000300");
        assert.equal(data.crc, "4dbdb3fd");
        assert.equal(data.pupKeyId, "eef6d4e2");
      });

      consume(data);
    });
  });
});
