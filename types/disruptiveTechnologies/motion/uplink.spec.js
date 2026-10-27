import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Disruptive Technologies Motion Sensor Uplink", () => {
  let motionSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    motionSchema = loadSchema(`${import.meta.dirname}/motion.schema.json`);
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
      expectSample("motion", motionSchema, (data) => {
        assert.equal(data.motion, true);
        assert.equal(data.repeat, false);
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
