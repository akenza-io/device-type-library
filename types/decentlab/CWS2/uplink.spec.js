import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Decentlab CWS2 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let errorSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    done();
  });

  before((done) => {
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  before((done) => {
    loadSchema(`${__dirname}/error.schema.json`).then((parsedSchema) => {
      errorSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    // Test vectors are the examples published with Decentlab's own decoders
    // (github.com/decentlab/decentlab-decoders, DL-CWS2).
    it("should decode the Decentlab CWS2 payload", () => {
      const data = {
        data: {
          payloadHex: "0258c000074676fa0a81c9813fa6d88137802581300b91",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperatureRadiationShield, 3.17);
        assert.equal(value.data.humidityRadiationShield, 97.67);
        assert.equal(value.data.surfaceTemperature, 4.57);
        assert.equal(value.data.temperature, 3.19);
        assert.equal(value.data.humidity, 99.44);
        assert.equal(value.data.dewPoint, 3.11);
        assert.equal(value.data.angle, 37);
        assert.equal(value.data.sensorTemperature, 3.04);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.961);
        assert.equal(value.data.batteryLevel, 96);
        assert.equal(value.data.deviceId, 22720);
        assert.equal(value.data.protocolVersion, 2);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a battery-only payload without a default sample", () => {
      const data = {
        data: {
          payloadHex: "0258c000040b91",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.961);
        assert.equal(value.data.batteryLevel, 96);
        assert.equal(value.data.deviceId, 22720);
        assert.equal(value.data.protocolVersion, 2);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should emit an error for an unsupported protocol version", () => {
      const data = {
        data: {
          payloadHex: "0158c000040b91",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "error");
        assert.equal(value.data.reason, "UNSUPPORTED_PROTOCOL_VERSION");
        assert.equal(value.data.payload, "0158c000040b91");

        validateSchema(value.data, errorSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
