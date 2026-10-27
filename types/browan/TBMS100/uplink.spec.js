import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("TBMS100 uplink", () => {
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
    it("Should decode TBDMS100 payload", () => {
      const data = {
        data: {
          port: 102,
          payloadHex: "017b341600510c00",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.batteryVoltage, 3.6);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.motion, true);
        assert.equal(data.temperature, 20);
        assert.equal(data.time, 22);
        assert.equal(data.count, 3153);
      });

      consume(data);
    });

    it("Should decode TBMS100 config payload", () => {
      const data = {
        data: {
          port: 204,
          payloadHex: "00100e02580203050400000500148101",
        },
      };

      expectSample("config", configSchema, (data) => {
        assert.equal(data.reportInterval, 3600);
        assert.equal(data.occupiedOverride, 600);
        assert.equal(data.freeDetection, 5);
        assert.equal(data.triggerCount, 0);
        assert.equal(data.pirParameter, "01811400");
      });

      consume(data);
    });

    it("Should decode TBMS100 system payload", () => {
      const data = {
        data: {
          port: 222,
          payloadHex: "0106000000000600007ff1f102e2d4f6ee",
        },
      };

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.bootloader, "00000006");
        assert.equal(data.hwId, "00000600");
        assert.equal(data.crc, "02f1f17f");
        assert.equal(data.pupKeyId, "eef6d4e2");
      });

      consume(data);
    });
  });
});
