import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Digital Technologies Proximity Counter Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    objectPresentSchema = loadSchema(`${import.meta.dirname}/object_present_count.schema.json`);
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

      expectSample("object_present_count", objectPresentSchema, (data) => {
        assert.equal(data.objectPresentCount, 4176);
        assert.equal(data.relativeCount, 0);
        assert.equal(data.repeat, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 4176);
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });
  });
});
