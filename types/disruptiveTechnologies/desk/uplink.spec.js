import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Digital Technologies Desk Sensor Uplink", () => {
  let occupancySchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Desk Sensor payload", () => {
      const data = {
        "data": {
          "deskOccupancy": {
            "state": "NOT_OCCUPIED",
            "updateTime": "2025-05-09T10:46:46.000000Z",
            "remarks": []
          },
          "eventType": "deskOccupancy",
          "labels": {},
          "eventId": "d0etq5jlo1jc73as7ur0",
          "targetName": "projects/d0cv6cco848c73ajtmv0/devices/cj5jpe7r23r0008c1pmg"
        },
        "topic": "default",
        "state": {},
        "timestamp": 1746787606
      };

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 0);
        assert.equal(data.occupancyStatus, "FREE");
        assert.equal(data.occupied, false);
        assert.equal(data.occupiedOrWarm, false);
        assert.equal(data.warm, false);
        assert.equal(data.repeat, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.equal(value.lastOccupiedValue, false);
        assert.isDefined(value.lastSampleEmittedAt);
        assert.isDefined(value.lastOccupancyTimestamp);
        assert.isDefined(value.occupiedMinutes);
      });

      consume(data);
    });

    it("should decode the Digital Technologies Desk Sensor payload", () => {
      const data = {
        "data": {
          "deskOccupancy": {
            "state": "OCCUPIED",
            "updateTime": "2025-05-09T10:46:46.000000Z",
            "remarks": []
          },
          "eventType": "deskOccupancy",
          "labels": {},
          "eventId": "d0etq5jlo1jc73as7ur0",
          "targetName": "projects/d0cv6cco848c73ajtmv0/devices/cj5jpe7r23r0008c1pmg"
        },
        "topic": "default",
        "state": {},
        "timestamp": 1746787606
      };

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupiedMinutes, 0);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 1);
        assert.equal(data.occupancyStatus, "OCCUPIED");
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
        assert.equal(data.repeat, false);
      });


      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.equal(value.lastOccupiedValue, true);
        assert.isDefined(value.lastSampleEmittedAt);
        assert.exists(value.firstOccupancyTimestamp);
      });

      consume(data);
    });

    it("should repeat the Digital Technologies Contact Sensor payload", () => {
      const data = {
        eventId: "c510f9ag03fligl8tvag",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "networkStatus",
        data: {
          eventType: "networkStatus",
          "networkStatus": {
            "signalStrength": 10,
            "rssi": 10,
            "transmissionMode": "HIGH_POWER_BOOST_MODE",
            "updateTime": "2024-12-06T14:23:50.728000Z"
          }
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
        state: {
          lastOccupiedValue: true,
          lastNetworkEmittedAt: new Date().getTime() - 10 * 60 * 1000,
          firstOccupancyTimestamp: new Date().getTime() - 10 * 60 * 1000,
          lastSampleEmittedAt: 1752131670374
        }
      };

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupiedMinutes, 10);
        assert.equal(data.minutesSinceLastOccupied, 0);
        assert.equal(data.occupancy, 1);
        assert.equal(data.occupancyStatus, "OCCUPIED");
        assert.equal(data.occupied, true);
        assert.equal(data.occupiedOrWarm, true);
        assert.equal(data.warm, false);
        assert.equal(data.repeat, true);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastOccupiedValue, true);
        assert.isDefined(value.lastSampleEmittedAt);
        assert.isDefined(value.lastNetworkEmittedAt);
      });

      consume(data);
    });
  });
});
