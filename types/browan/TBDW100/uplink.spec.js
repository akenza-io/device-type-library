import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("TBDW100 uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let doorCountSchema = null;
  let systemSchema = null;
  let configSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    doorCountSchema = loadSchema(`${import.meta.dirname}/door_count.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    configSchema = loadSchema(`${import.meta.dirname}/config.schema.json`);
  });

  describe("consume()", () => {
    it("Should decode TBDW100 payload", () => {
      const data = {
        state: {},
        data: {
          port: 100,
          payloadHex: "017b345cb1510c00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value.lastCount, 3153);
        assert.isNotNull(value.partialUsage, 0);
      });

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 0);
        assert.equal(data.usageCount, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.batteryVoltage, 3.6);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.open, true);
        assert.equal(data.temperature, 20);
        assert.equal(data.time, 45404);
        assert.equal(data.relativeCount, 0);
        assert.equal(data.count, 3153);
      });

      consume(data);
    });

    it("Should decode TBDW100 payload", () => {
      const data = {
        state: { lastCount: 3053, partialUsage: 0 },
        data: {
          port: 100,
          payloadHex: "017b345cb1510c00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.equal(value.lastCount, 3153);
        assert.equal(value.partialUsage, 0);
      });

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 50);
        assert.equal(data.usageCount, 25);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.batteryVoltage, 3.6);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.open, true);
        assert.equal(data.temperature, 20);
        assert.equal(data.time, 45404);
        assert.equal(data.relativeCount, 100);
        assert.equal(data.count, 3153);
      });

      consume(data);
    });

    it("Should decode TBDW100 config payload", () => {
      const data = {
        data: {
          port: 204,
          payloadHex: "00100E8064",
        },
      };

      expectSample("config", configSchema, (data) => {
        assert.equal(data.keepaliveInterval, 3600);
      });

      consume(data);
    });

    it("Should decode TBDW100 system payload", () => {
      const data = {
        data: {
          port: 222,
          payloadHex: "010600000001020000ccac1f59e2d4f6ee",
        },
      };

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.bootloader, "00000006");
        assert.equal(data.hwId, "00000201");
        assert.equal(data.crc, "591faccc");
        assert.equal(data.pupKeyId, "eef6d4e2");
      });

      consume(data);
    });
  });
});
