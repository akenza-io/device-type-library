import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Decentlab IAM Uplink", () => {
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
    it("should decode IAM payload", () => {
      const data = {
        data: {
          payloadHex: "020bbd007f0b926a515d48bc4e0262006981c7000093d4000b0111",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 27.68);
        assert.equal(data.humidity, 36.44);
        assert.equal(data.pressure, 964.12);
        assert.equal(data.co2, 455);
        assert.equal(data.voc, 273);
        assert.equal(data.light, 678.77);
        assert.equal(data.pir, 11);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.96);
        assert.equal(data.batteryLevel, 96);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceID, 3005);
        assert.equal(data.co2SensorStatus, 0);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.exists(value.firstOccupancyTimestamp);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 1);
        assert.equal(data.occupancyStatus, "OCCUPIED");
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
      });

      consume(data);
    });
  });
});