import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Digital Technologies Proximity Sensor Uplink", () => {
  let motionSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/motion.schema.json`).then((parsedSchema) => {
      motionSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Motion Sensor payload", () => {
      const data = {
        eventId: "ccq69r6aj8umkq4e3qcg",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/cbtkmp35v22000e2iqrg",
        eventType: "motion",
        data: {
          eventType: "motion",
          motion: {
            state: "MOTION_DETECTED",
            updateTime: "2022-09-28T15:14:52.571000Z",
          },
        },
        timestamp: "2022-09-28T15:14:52.571000Z",
      };
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "motion");
        assert.equal(value.data.motion, true);

        validateSchema(value.data, motionSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastMotion, true);
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });
  });
});
