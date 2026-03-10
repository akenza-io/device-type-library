import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Dragino dds20-lb Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let configurationSchema = null;
  let consume = null;

  beforeEach(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    [defaultSchema, lifecycleSchema, configurationSchema] = await Promise.all([
      loadSchema(`${__dirname}/default.schema.json`),
      loadSchema(`${__dirname}/lifecycle.schema.json`),
      loadSchema(`${__dirname}/configuration.schema.json`),
    ]);
  });

  describe("consume()", () => {
    it("should decode the Dragino dds20-lb uplink default uplink", () => {
      const data = {
        data: {
          payloadHex: "0D020018000CCC01",
          port: 2,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.distance, 24);
        assert.equal(value.data.interruptFlag, false);
        assert.equal(value.data.temperature, 327.6);
        assert.equal(value.data.sensorFlag, true);

        validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.33);

        validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.sensorModel, "DDS20-LB");
        assert.equal(value.data.frequencyBand, "EU868");
        assert.equal(value.data.subBand, "UNKNOWN");
        assert.equal(value.data.firmwareVersion, "1.1.0");

        validateSchema(value.data, configurationSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.346);

        validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
