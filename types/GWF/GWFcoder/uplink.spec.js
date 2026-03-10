

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("GWF RCM®-LRW10", () => {
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

  describe("consume()", () => {
    it("should decode the GWF RCM®-LRW10 payload default", () => {
      const data = {
        state: {},
        data: {
          port: 1,
          payloadHex: "02E61E785634120700C80113F803000000E8",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.meterMedium, "WATER");
        assert.equal(value.data.actualityDuration, 456);
        assert.equal(value.data.volume, 1.016);
        assert.equal(value.data.relativeVolume, 0);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.protocolType, 2);
        assert.equal(value.data.manufacturerID, 7910);
        assert.equal(value.data.meterID, 12345678);
        assert.equal(value.data.appError, "NO_ERROR");
        assert.equal(value.data.batteryPowerLow, false);
        assert.equal(value.data.permantError, false);
        assert.equal(value.data.temporaryError, false);
        assert.equal(value.data.commandError1, false);
        assert.equal(value.data.commandError2, false);
        assert.equal(value.data.commandError3, false);
        assert.equal(value.data.continuousFlow, false);
        assert.equal(value.data.brokenPipe, false);
        assert.equal(value.data.batteryLow, false);
        assert.equal(value.data.backflow, false);
        assert.equal(value.data.noUsage, false);
        assert.equal(value.data.loraLinkError, false);
        assert.equal(value.data.batteryLifetime, 138);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastVolume, 1.016);
      });

      consume(data);
    });

    it("should decode the GWF RCM®-LRW10 payload default and calculate increment", () => {
      const data = {
        state: { lastVolume: 0.5 },
        data: {
          port: 1,
          payloadHex: "02E61E785634120700C80113F803000000E8",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.meterMedium, "WATER");
        assert.equal(value.data.actualityDuration, 456);
        assert.equal(value.data.volume, 1.016);
        assert.equal(value.data.relativeVolume, 0.516);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.protocolType, 2);
        assert.equal(value.data.manufacturerID, 7910);
        assert.equal(value.data.meterID, 12345678);
        assert.equal(value.data.appError, "NO_ERROR");
        assert.equal(value.data.batteryPowerLow, false);
        assert.equal(value.data.permantError, false);
        assert.equal(value.data.temporaryError, false);
        assert.equal(value.data.commandError1, false);
        assert.equal(value.data.commandError2, false);
        assert.equal(value.data.commandError3, false);
        assert.equal(value.data.continuousFlow, false);
        assert.equal(value.data.brokenPipe, false);
        assert.equal(value.data.batteryLow, false);
        assert.equal(value.data.backflow, false);
        assert.equal(value.data.noUsage, false);
        assert.equal(value.data.loraLinkError, false);
        assert.equal(value.data.batteryLifetime, 138);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastVolume, 1.016);
      });

      consume(data);
    });
  });
});
