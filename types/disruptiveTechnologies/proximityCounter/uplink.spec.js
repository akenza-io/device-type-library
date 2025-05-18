const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Proximity Counter Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/object_present_count.schema.json`)
      .then((parsedSchema) => {
        objectPresentSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Proximity Counter Sensor payload", () => {
      const data = {
        eventId: "c510f9ag03fligl8tvag",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "objectPresentCount",
        data: {
          eventType: "objectPresentCount",
          "objectPresentCount": {
            "total": 4176,
            "updateTime": "2024-12-06T08:23:43.209000Z"
          }
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present_count");
        assert.equal(value.data.objectPresentCount, 4176);

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
