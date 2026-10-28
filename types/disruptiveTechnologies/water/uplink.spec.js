import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Digital Technologies Water Sensor Uplink", () => {
  let waterPresentSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    waterPresentSchema = loadSchema(`${import.meta.dirname}/water_present.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Water Sensor payload", () => {
      const data = {
        eventId: "c505kmuj0aoraraqu5g0",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/emuc4ah9r13um94o4pp3hdg",
        eventType: "waterPresent",
        data: {
          eventType: "waterPresent",
          waterPresent: {
            state: "NOT_PRESENT",
            updateTime: "2021-05-16T08:37:10.711412Z",
          },
        },
        timestamp: "2021-09-14T08:16:27.517331Z",
        labels: { name: "Temperature Simulator" },
      };

      expectSample("water_present", waterPresentSchema, (data) => {
        assert.equal(data.waterPresent, "NOT_PRESENT");
        assert.equal(data.leakageDetected, false);
        assert.equal(data.repeat, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastWaterPresent, "NOT_PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });
  });
});
