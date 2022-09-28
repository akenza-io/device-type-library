const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Proximity Sensor Uplink", () => {
  let motionSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/motion.schema.json`).then((parsedSchema) => {
      motionSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Proximity Sensor payload", () => {
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
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "NOT_PRESENT");

        validate(value.data, motionSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
