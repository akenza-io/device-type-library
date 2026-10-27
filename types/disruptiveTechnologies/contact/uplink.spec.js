import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Digital Technologies Contact Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;
  let networkStatusSchema = null;
  let doorCountSchema = null;
  let washroomUsageSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    objectPresentSchema = loadSchema(`${import.meta.dirname}/contact.schema.json`);
    networkStatusSchema = loadSchema(`${import.meta.dirname}/network_status.schema.json`);
    doorCountSchema = loadSchema(`${import.meta.dirname}/door_count.schema.json`);
    washroomUsageSchema = loadSchema(`${import.meta.dirname}/washroom_usage.schema.json`);
  });


  describe("consume()", () => {
    it("should decode the Digital Technologies Contact Sensor payload", () => {
      const data = {
        state: {},
        eventId: "c510f9ag03fligl8tvag",
        device: {
          tags: ["washroom_usage"]
        },
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "contact",
        data: {
          eventType: "contact",
          "contact": {
            "state": "OPEN",
            "updateTime": "2024-12-06T14:23:50.728000Z"
          }
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
      };

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 0);
        assert.equal(data.usageCount, 0);
      });

      expectSample("contact", objectPresentSchema, (data) => {
        assert.equal(data.contact, "OPEN");
        assert.equal(data.closedSince, 0);
        assert.equal(data.openSince, 0);
        assert.equal(data.repeat, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastContact, "OPEN");
        assert.isDefined(value.lastSampleEmittedAt);
        assert.isDefined(value.firstOpening);
      });

      consume(data);
    });


    it("should repeat the Digital Technologies Contact Sensor payload with existing state", () => {
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
          lastContact: "OPEN",
          lastCount: 0,
          lastSampleEmittedAt: new Date().setMinutes(new Date().getMinutes() - 90),
          firstOpening: new Date().setMinutes(new Date().getMinutes() - 90)
        }
      };

      expectSample("network_status", networkStatusSchema, (data) => {
        assert.equal(data.signalStrength, 10);
        assert.equal(data.rssi, 10);
        assert.equal(data.transmissionMode, "HIGH_POWER_BOOST_MODE");
        assert.equal(data.sqi, 3);
      });

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 0);
        assert.equal(data.usageCount, 0);
      });

      expectSample("contact", objectPresentSchema, (data) => {
        assert.equal(data.contact, "OPEN");
        assert.equal(data.closedSince, 0);
        assert.equal(data.openSince, 90);
        assert.equal(data.count, 0);
        assert.equal(data.hasContact, false);
        assert.equal(data.relativeCount, 0);
        assert.equal(data.repeat, true);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastContact, "OPEN");
        assert.isDefined(value.lastSampleEmittedAt);
        assert.isDefined(value.lastNetworkEmittedAt);
      });

      consume(data);
    });

    it("should repeat the Digital Technologies Contact Sensor payload with existing state having usage counts", () => {
      const data = {
        eventId: "c510f9ag03fligl8tvag",
        device: {
          tags: ["washroom_usage"]
        },
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "contact",
        data: {
          eventType: "contact",
          "contact": {
            "state": "OPEN",
            "updateTime": "2024-12-06T14:23:50.728000Z"
          }
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        state: {
          lastContact: "CLOSED",
          lastSampleEmittedAt: 1752131670374,
          lastCount: 12,
          partialDoorClosing: 1,
          partialUsage: 1
        }
      };

      expectSample("washroom_usage", washroomUsageSchema, (data) => {
        assert.equal(data.absoluteUsageCount, 6);
        assert.equal(data.relativeUsageCount, 1);
      });

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 2);
        assert.equal(data.usageCount, 1);
      });

      expectSample("contact", objectPresentSchema, (data) => {
        assert.equal(data.contact, "OPEN");
        assert.equal(data.hasContact, false);
        assert.equal(data.count, 13);
        assert.equal(data.relativeCount, 1);
        assert.equal(data.repeat, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastContact, "OPEN");
        assert.isDefined(value.lastSampleEmittedAt);
        assert.equal(value.lastCount, 13);
        assert.equal(value.partialUsage, 0);
        assert.equal(value.partialDoorClosing, 0);
      });

      consume(data);
    });


    it("should supress the Digital Technologies Contact Sensor network payload", () => {
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
          lastContact: "OPEN",
          lastSampleEmittedAt: new Date().getTime(),
          lastNetworkEmittedAt: new Date().getTime()
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastContact, "OPEN");
        assert.isDefined(value.lastSampleEmittedAt);
        assert.isDefined(value.lastNetworkEmittedAt);
      });

      consume(data);
    });
  });
});
