const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Desk Sensor Uplink", () => {
  let occupancySchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/occupancy.schema.json`).then((parsedSchema) => {
      occupancySchema = parsedSchema;
      done();
    });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupied, false);
        assert.equal(value.data.occupancy, 0);
        assert.equal(value.data.minutesSinceLastOccupied, 0);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.equal(value.lastOccupiedValue, false);
        assert.isDefined(value.lastSampleEmittedAt);
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.occupancy, 2);
        assert.equal(value.data.minutesSinceLastOccupied, 0);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.equal(value.lastOccupiedValue, true);
        assert.isDefined(value.lastSampleEmittedAt);
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
          lastNetworkEmittedAt: new Date().getTime(),
          lastSampleEmittedAt: 1752131670374
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.occupancy, 2);
        assert.equal(value.data.minutesSinceLastOccupied, 0);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
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
