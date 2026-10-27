import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("TBWater leak uplink", () => {
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
    it("should decode TBWater leak payload", () => {
      const data = {
        data: {
          port: 106,
          payloadHex: "000b3628",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.waterleak, false);
        assert.equal(data.temperature, 22);
        assert.equal(data.humidity, 40);
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

      expectSample("config", configSchema, (data) => {
        assert.equal(data.keepaliveInterval, 3600);
        assert.equal(data.temperatureDelta, 32);
        assert.equal(data.humidityDelta, 48);
        assert.equal(data.sensorDetectionInterval, 30);
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

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.bootloader, "00000006");
        assert.equal(data.hwId, "00001400");
        assert.equal(data.crc, "02f1f17f");
        assert.equal(data.pupKeyId, "eef6d4e2");
      });

      consume(data);
    });
  });
});
