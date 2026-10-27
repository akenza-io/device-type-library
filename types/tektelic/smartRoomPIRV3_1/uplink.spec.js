import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Tektelic Smart Room PIR Sensor V3.1 Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  let defaultSchema = null;
  let occupancySchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Tektelic Smart Room PIR Sensor standart payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "036700f204686100ba0bc1",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.01);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 24.2);
        assert.equal(data.humidity, 48.5);
      });

      consume(data);
    });

    it("should decode the Tektelic Smart Room PIR Sensor occupancy payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "0a0000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.lastOccupancyTimestamp);
        assert.exists(value.occupiedMinutes);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 0);
        assert.equal(data.motion, 0);
        assert.equal(data.occupancyStatus, "FREE");
        assert.equal(data.occupied, false);
        assert.equal(data.occupiedOrWarm, false);
        assert.equal(data.warm, false);
      });

      consume(data);
    });

    it("should decode the Tektelic Smart Room PIR Sensor occupancy payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "0a00ff",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.firstOccupancyTimestamp);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 1);
        assert.equal(data.motion, 1);
        assert.equal(data.occupancyStatus, "OCCUPIED");
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
      });

      consume(data);
    });
  });
});
