import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Digital Technologies Proximity Counter Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/object_present_count.schema.json`).then(
      (parsedSchema) => {
        objectPresentSchema = parsedSchema;
        done();
      },
    );
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
          objectPresentCount: {
            total: 4176,
            updateTime: "2024-12-06T08:23:43.209000Z",
          },
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present_count");
        assert.equal(value.data.objectPresentCount, 4176);
        assert.equal(value.data.relativeCount, 0);

        validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
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
