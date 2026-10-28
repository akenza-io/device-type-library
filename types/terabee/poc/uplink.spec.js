import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Terabee poc Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let occupancySchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
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

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupied, true);
        assert.equal(data.occupancyStatus, "OCCUPIED");
        assert.equal(data.occupancy, 6);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.zone0, true);
        assert.equal(data.zone1, true);
        assert.equal(data.zone2, true);
        assert.equal(data.zone3, true);
        assert.equal(data.zone4, true);
        assert.equal(data.zone5, true);
        assert.equal(data.zone6, false);
        assert.equal(data.zone7, false);
        assert.equal(data.zoneGobal, 6);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.wifiApEnabled, false);
        assert.equal(data.warmup, false);
        assert.equal(data.tpcStuck, false);
        assert.equal(data.tpcStopped, false);

        assert.equal(data.zone0Active, 'ACTIVE');
        assert.equal(data.zone1Active, 'ACTIVE');
        assert.equal(data.zone2Active, 'ACTIVE');
        assert.equal(data.zone3Active, 'ACTIVE');
        assert.equal(data.zone4Active, 'ACTIVE');
        assert.equal(data.zone5Active, 'ACTIVE');
        assert.equal(data.zone6Active, 'NOT_SET');
        assert.equal(data.zone7Active, 'NOT_SET');
      });

      consume(data);
    });
  });
});
