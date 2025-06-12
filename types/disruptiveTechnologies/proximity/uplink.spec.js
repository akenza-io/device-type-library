const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Proximity Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/object_present.schema.json`)
      .then((parsedSchema) => {
        objectPresentSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Proximity Sensor payload and init state", () => {
      const data = {
        eventId: "c510f9ag03fligl8tvag",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "objectPresent",
        data: {
          eventType: "objectPresent",
          objectPresent: {
            state: "NOT_PRESENT",
            updateTime: "2021-09-15T14:48:05.948000Z",
          },
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.absoluteCount, 0);
        assert.equal(value.lastStatus, "NOT_PRESENT");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "NOT_PRESENT");
        assert.equal(value.data.proximity, false);
        assert.equal(value.data.absoluteCount, 0);
        assert.equal(value.data.relativeCount, 0);

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("Check if the state counts up correctly", () => {
      const data = {
        eventId: "c510f9ag03fligl8tvag",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "objectPresent",
        data: {
          eventType: "objectPresent",
          objectPresent: {
            state: "PRESENT",
            updateTime: "2021-09-15T14:48:05.948000Z",
          },
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
        state: {
          absoluteCount: 0,
          lastStatus: "NOT_PRESENT"
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.absoluteCount, 1);
        assert.equal(value.lastStatus, "PRESENT");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "PRESENT");
        assert.equal(value.data.proximity, true);
        assert.equal(value.data.absoluteCount, 1);
        assert.equal(value.data.relativeCount, 1);

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
