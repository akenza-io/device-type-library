import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Pressac RCS Uplink", () => {
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

  let occupancySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Pressac RCS default payload", () => {
      const data = {
        data: {
          payloadHex: "0620130031825a55015e",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 22.5);
        assert.equal(value.data.humidity, 45);
        assert.equal(value.data.soundLevel, 42.5);
        assert.equal(value.data.illumination, 350);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.revision, 0);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.tempHumActive, true);
        assert.equal(value.data.soundLevelActive, true);
        assert.equal(value.data.luxActive, true);
        assert.equal(value.data.pirActive, false);
        assert.equal(value.data.dataAge, 0);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Pressac RCS boot payload", () => {
      const data = {
        data: {
          payloadHex: "06101305410200711e140a140a",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "configuration");
        assert.equal(value.data.firmwareVersion, "0.5.4.1");
        assert.equal(value.data.resetReason, "HARD_RESET");
        assert.equal(value.data.hardwareRegionSelection, "EU868");
        assert.equal(value.data.readConfiguration, "DIP_SWITCH");
        assert.equal(value.data.readInterval, 15);
        assert.equal(value.data.pirAbsenceTimeout, 20);
        assert.equal(value.data.pirRepeatedTimeOut, 10);
        assert.equal(value.data.temperatureOffset, 20);
        assert.equal(value.data.temperatureOffsetScaled, 0);
        assert.equal(value.data.humidityOffset, 10);
        assert.equal(value.data.humidityOffsetScaled, 0);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.revision, 0);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.tempHumActive, true);
        assert.equal(value.data.luxActive, true);
        assert.equal(value.data.soundLevelActive, true);
        assert.equal(value.data.pirActive, true);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Pressac RCS occupancy payload", () => {
      const data = {
        data: {
          payloadHex: "0630130001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.occupancy, 1);

        validateSchema(value.data, occupancySchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.revision, 0);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.dataAge, 0);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
