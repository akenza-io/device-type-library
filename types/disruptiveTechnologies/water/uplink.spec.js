const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Water Sensor Uplink", () => {
  let waterPresentSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/water_present.schema.json`)
      .then((parsedSchema) => {
        waterPresentSchema = parsedSchema;
        done();
      });
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
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "water_present");
        assert.equal(value.data.waterPresent, "NOT_PRESENT");

        utils.validateSchema(value.data, waterPresentSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
