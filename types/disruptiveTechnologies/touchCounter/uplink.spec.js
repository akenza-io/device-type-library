import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Digital Technologies Touch Count Sensor Uplink", () => {
  let touchSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    touchSchema = loadSchema(`${import.meta.dirname}/touch_count.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Touch Count Sensor payload", () => {
      const data = {
        eventId: "c505kmuj0aoraraqu5g0",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/emuc4ah9r13um94o4pp3hdg",
        eventType: "touchCount",
        data: {
          eventType: "touchCount",
          "touchCount": {
            "total": 469,
            "updateTime": "2024-12-06T08:25:21.604000Z"
          }
        },
        timestamp: "2021-09-14T08:16:27.517331Z",
        labels: { name: "Temperature Simulator" },
      };
      expectSample("touch_count", touchSchema, (data) => {
        assert.equal(data.touchCount, 469);
      });

      consume(data);
    });
  });
});
