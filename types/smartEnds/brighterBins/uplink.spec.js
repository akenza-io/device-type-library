

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Brigther Bins uplink", () => {
  let distanceSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/distance.schema.json`)
      .then((parsedSchema) => {
        distanceSchema = parsedSchema;
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

  let fillLevelSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/fill_level.schema.json`)
      .then((parsedSchema) => {
        fillLevelSchema = parsedSchema;
        done();
      });
  });

  let systemSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/system.schema.json`).then((parsedSchema) => {
      systemSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Brigther Bins Type Filllevel payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "308e30",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "fill_level");
        assert.equal(value.data.fillLevel, 12);

        validateSchema(value.data, fillLevelSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 96);
        assert.equal(value.data.temperature, 31);
        assert.equal(value.data.resetReason, "CLEARED");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Brigther Bins Type Distance payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "308e31",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "distance");
        assert.equal(value.data.distance, 396);

        validateSchema(value.data, distanceSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.temperature, -23);
        assert.equal(value.data.batteryLevel, 24);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Brigther Bins Type System payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FFD2380163D06808013C63C2",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.communicationTest, true);
        assert.equal(value.data.distanceTest, true);
        assert.equal(value.data.temperatureTest, true);

        assert.equal(value.data.hardwareVersion, 22);
        assert.equal(value.data.softwareVersion, "1.15.1");
        assert.equal(value.data.totalResetCount, 1);
        assert.equal(value.data.runtime, 2);
        assert.equal(value.data.downlinkFreq, 2);
        assert.equal(value.data.noOfDownlinks, 2);

        validateSchema(value.data, systemSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 98);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.resetReason, "CLEARED");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
