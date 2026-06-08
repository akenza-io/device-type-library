

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Elsys ELT-2 uplink", () => {
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

  let configurationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/configuration.schema.json`)
      .then((parsedSchema) => {
        configurationSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Elsys ELT-2 payload", () => {
      const data = {
        data: {
          payloadHex: "0100e20218070e410cff5614000edd20",
          port: 5,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 22.6);
        assert.equal(value.data.humidity, 24);
        assert.equal(value.data.pressure, 974.112);
        assert.equal(value.data.externalTemperature1, -17);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.649);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Elsys ELT-2 configuration payload", () => {
      const data = {
        data: {
          payloadHex:
            "3e560701080509010a000b050c050d000e00110214000002581500000001170000000118000000011a000493e01e000000011f000000012000000000220004006425032600270028002e012f00300134003b00f53ffb0d56",
          port: 6,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "configuration");
        assert.equal(value.data.ota, true);
        assert.equal(value.data.port, 5);
        assert.equal(value.data.mode, 1);
        assert.equal(value.data.ack, false);
        assert.equal(value.data.drDef, 5);
        assert.equal(value.data.drMax, 5);
        assert.equal(value.data.drMin, 0);
        assert.equal(value.data.class, 0);
        assert.equal(value.data.pirCfg, 2);
        assert.equal(value.data.splPer, 600);
        assert.equal(value.data.tempPer, 1);
        assert.equal(value.data.lightPer, 1);
        assert.equal(value.data.pirPer, 1);
        assert.equal(value.data.extPer, 300000);
        assert.equal(value.data.vddPer, 1);
        assert.equal(value.data.sendPer, 1);
        assert.equal(value.data.lock, 0);
        assert.equal(value.data.link, "00040064");
        assert.equal(value.data.plan, 3);
        assert.equal(value.data.subBand, 0);
        assert.equal(value.data.lbt, false);
        assert.equal(value.data.ledConfig, 0);
        assert.equal(value.data.qSize, 1);
        assert.equal(value.data.qOffset, false);
        assert.equal(value.data.qPurge, true);
        assert.equal(value.data.pirSensivity, 0);
        assert.equal(value.data.asr, false);
        assert.equal(value.data.sensor, "ERS2_EYE");
        assert.equal(value.data.version, 3414);

        validateSchema(value.data, configurationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
