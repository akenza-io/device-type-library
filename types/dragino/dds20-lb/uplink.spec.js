import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino dds20-lb Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let configurationSchema = null;
  let consume = null;

  beforeEach(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    configurationSchema = loadSchema(`${import.meta.dirname}/configuration.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino dds20-lb uplink default uplink", () => {
      const data = {
        data: {
          payloadHex: "0D020018000CCC01",
          port: 2,
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.distance, 24);
        assert.equal(data.interruptFlag, false);
        assert.equal(data.temperature, 327.6);
        assert.equal(data.sensorFlag, true);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.33);
      });

      consume(data);
    });
  });
  describe("consume()", () => {
    it("should decode the Dragino dds20-lb uplink config uplink", () => {
      const data = {
        data: {
          payloadHex: "29011001000D12",
          port: 5,
        },
      };

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.sensorModel, "DDS20-LB");
        assert.equal(data.frequencyBand, "EU868");
        assert.equal(data.subBand, "UNKNOWN");
        assert.equal(data.firmwareVersion, "1.1.0");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.346);
      });

      consume(data);
    });
  });
});
