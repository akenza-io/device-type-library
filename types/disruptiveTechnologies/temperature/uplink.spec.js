import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Digital Technologies Temperature Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Temperature Sensor payload", () => {
      const data = {
        eventId: "c505kmuj0aoraraqu5g0",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/emuc4ah9r13um94o4pp3hdg",
        eventType: "temperature",
        data: {
          eventType: "temperature",
          temperature: {
            value: 24,
            updateTime: "2021-09-14T08:16:27.517331Z",
            samples: [{ value: 24, sampleTime: "2021-09-14T08:16:27.517331Z" }],
          },
        },
        timestamp: "2021-09-14T08:16:27.517331Z",
        labels: { name: "Temperature Simulator" },
      };
      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 24);
        assert.equal(data.temperatureF, 75.2);
      });

      consume(data);
    });
  });
});
