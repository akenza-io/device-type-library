import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Decentlab SMTP Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Decentlab SMTP payload", () => {
      const data = {
        data: {
          payloadHex:
            "020b50000309018a8c09438a9809278a920b3c8aa50c9c8a8c11e08aa500000000000000000b3b",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.soilMoistureAtDepth0, -0.39);
        assert.equal(value.data.soilTemperatureAtDepth0, 27);
        assert.equal(value.data.soilTemperatureAtDepth0F, 80.6);
        assert.equal(value.data.soilMoistureAtDepth1, -0.258);
        assert.equal(value.data.soilTemperatureAtDepth1, 27.12);
        assert.equal(value.data.soilTemperatureAtDepth1F, 80.8);
        assert.equal(value.data.soilMoistureAtDepth2, -0.314);
        assert.equal(value.data.soilTemperatureAtDepth2, 27.06);
        assert.equal(value.data.soilTemperatureAtDepth2F, 80.7);
        assert.equal(value.data.soilMoistureAtDepth3, 0.752);
        assert.equal(value.data.soilTemperatureAtDepth3, 27.25);
        assert.equal(value.data.soilTemperatureAtDepth3F, 81.1);
        assert.equal(value.data.soilMoistureAtDepth4, 1.456);
        assert.equal(value.data.soilTemperatureAtDepth4, 27);
        assert.equal(value.data.soilTemperatureAtDepth4F, 80.6);
        assert.equal(value.data.soilMoistureAtDepth5, 4.152);
        assert.equal(value.data.soilTemperatureAtDepth5, 27.25);
        assert.equal(value.data.soilTemperatureAtDepth5F, 81.1);
        assert.equal(value.data.soilMoistureAtDepth6, -5);
        assert.equal(value.data.soilTemperatureAtDepth6, -327.68);
        assert.equal(value.data.soilTemperatureAtDepth6F, -557.8);
        assert.equal(value.data.soilMoistureAtDepth7, -5);
        assert.equal(value.data.soilTemperatureAtDepth7, -327.68);
        assert.equal(value.data.soilTemperatureAtDepth7F, -557.8);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.875);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceId, 2896);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
