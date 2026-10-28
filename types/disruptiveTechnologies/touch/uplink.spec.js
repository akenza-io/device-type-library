import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Digital Technologies Touch Sensor Uplink", () => {
  let touchSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    touchSchema = loadSchema(`${import.meta.dirname}/touch.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Touch Sensor payload", () => {
      const data = {
        eventId: "c505kmuj0aoraraqu5g0",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/emuc4ah9r13um94o4pp3hdg",
        eventType: "touch",
        data: {
          eventType: "touch",
          touch: {
            updateTime: "2021-05-16T08:13:15.361624Z",
          },
        },
        timestamp: "2021-09-14T08:16:27.517331Z",
        labels: { name: "Temperature Simulator" },
      };
      expectSample("touch", touchSchema, (data) => {
        assert.equal(data.touch, true);
      });

      consume(data);
    });
  });
});
