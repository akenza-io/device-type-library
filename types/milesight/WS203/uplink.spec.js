import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("WS203 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WS203 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403673401046865050000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.lastOccupancyTimestamp);
        assert.exists(value.occupiedMinutes);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 50.5);
        assert.equal(data.temperature, 30.8);
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 0);
        assert.equal(data.occupancyStatus, "FREE");
        assert.equal(data.occupied, false);
        assert.equal(data.occupiedOrWarm, false);
        assert.equal(data.warm, false);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });

    it("should decode should decode the WS203 historic payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "20CEAE5BA664040024016520CE5C5CA6640301340165",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 50.5);
        assert.equal(data.occupied, false);
        assert.equal(data.occupancy, 0);
        assert.equal(data.temperature, 29.2);
        assert.equal(data.reportType, "PERIOD");
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 50.5);
        assert.equal(data.temperature, 30.8);
        assert.equal(data.reportType, "PIR_OCCUPANCY");
      });

      consume(data);
    });
  });
});
