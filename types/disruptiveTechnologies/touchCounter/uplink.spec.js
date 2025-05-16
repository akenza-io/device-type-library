const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Touch Count Sensor Uplink", () => {
  let touchSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/touch_count.schema.json`).then((parsedSchema) => {
      touchSchema = parsedSchema;
      done();
    });
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
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "touch_count");
        assert.equal(value.data.touchCount, 469);

        utils.validateSchema(value.data, touchSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
