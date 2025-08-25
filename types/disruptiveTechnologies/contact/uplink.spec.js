const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Contact Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/contact.schema.json`)
      .then((parsedSchema) => {
        objectPresentSchema = parsedSchema;
        done();
      });
  });

  let networkStatusSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/network_status.schema.json`)
      .then((parsedSchema) => {
        networkStatusSchema = parsedSchema;
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "contact");
        assert.equal(value.data.contact, "OPEN");

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastContact, "OPEN");
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
          lastContact: "OPEN",
          lastSampleEmittedAt: 1752131670374
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "network_status");
        assert.equal(value.data.signalStrength, 10);
        assert.equal(value.data.rssi, 10);
        assert.equal(value.data.transmissionMode, "HIGH_POWER_BOOST_MODE");
        assert.equal(value.data.sqi, 3);

        utils.validateSchema(value.data, networkStatusSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "contact");
        assert.equal(value.data.contact, "OPEN");

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastContact, "OPEN");
        assert.isDefined(value.lastSampleEmittedAt);
        assert.isDefined(value.lastNetworkEmittedAt);
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

      utils.expectEmits((type, value) => {
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
