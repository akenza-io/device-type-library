import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Terabee poc Uplink", () => {
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

  let occupancySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Terabee poc standard LoRa payload", () => {
      const data = {
        data: {
          port: 83,
          payloadHex: "0006010101010101ffff",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.exists(value.firstOccupancyTimestamp);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.occupancyStatus, "OCCUPIED");
        assert.equal(value.data.occupancy, 6);
        assert.equal(value.data.minutesSinceLastOccupied, 0);
        assert.equal(value.data.occupiedMinutes, 0);
        assert.equal(value.data.occupiedOrWarm, true);
        assert.equal(value.data.warm, false);

        validateSchema(value.data, occupancySchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.zone0, true);
        assert.equal(value.data.zone1, true);
        assert.equal(value.data.zone2, true);
        assert.equal(value.data.zone3, true);
        assert.equal(value.data.zone4, true);
        assert.equal(value.data.zone5, true);
        assert.equal(value.data.zone6, false);
        assert.equal(value.data.zone7, false);
        assert.equal(value.data.zoneGobal, 6);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.wifiApEnabled, false);
        assert.equal(value.data.warmup, false);
        assert.equal(value.data.tpcStuck, false);
        assert.equal(value.data.tpcStopped, false);

        assert.equal(value.data.zone0Active, 'ACTIVE');
        assert.equal(value.data.zone1Active, 'ACTIVE');
        assert.equal(value.data.zone2Active, 'ACTIVE');
        assert.equal(value.data.zone3Active, 'ACTIVE');
        assert.equal(value.data.zone4Active, 'ACTIVE');
        assert.equal(value.data.zone5Active, 'ACTIVE');
        assert.equal(value.data.zone6Active, 'NOT_SET');
        assert.equal(value.data.zone7Active, 'NOT_SET');

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
