

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Digital Technologies Contact Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/contact.schema.json`)
      .then((parsedSchema) => {
        objectPresentSchema = parsedSchema;
        done();
      });
  });

  let networkStatusSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/network_status.schema.json`)
      .then((parsedSchema) => {
        networkStatusSchema = parsedSchema;
        done();
      });
  });

  let doorCountSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/door_count.schema.json`)
      .then((parsedSchema) => {
        doorCountSchema = parsedSchema;
        done();
      });
  });


  describe("consume()", () => {
    it("should decode the Digital Technologies Contact Sensor payload", () => {
      const data = {
        eventId: "c510f9ag03fligl8tvag",
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 0);
        assert.equal(value.data.usageCount, 0);

        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "contact");
        assert.equal(value.data.contact, "OPEN");

        validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastContact, "OPEN");
        assert.isDefined(value.lastSampleEmittedAt);
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
          lastSampleEmittedAt: 1752131670374
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "network_status");
        assert.equal(value.data.signalStrength, 10);
        assert.equal(value.data.rssi, 10);
        assert.equal(value.data.transmissionMode, "HIGH_POWER_BOOST_MODE");
        assert.equal(value.data.sqi, 3);

        validateSchema(value.data, networkStatusSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 0);
        assert.equal(value.data.usageCount, 0);

        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "contact");
        assert.equal(value.data.contact, "OPEN");

        validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 2);
        assert.equal(value.data.usageCount, 1);

        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "contact");
        assert.equal(value.data.contact, "OPEN");
        assert.equal(value.data.hasContact, false);
        assert.equal(value.data.count, 13);
        assert.equal(value.data.relativeCount, 1);

        validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
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
