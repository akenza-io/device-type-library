const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Touch Sensor Uplink", () => {
  let touchSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/touch.schema.json`).then((parsedSchema) => {
      touchSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Touch Sensor payload", () => {
      const data = {
        data: {
          event: {
            eventId: "c505kmuj0aoraraqu5g0",
            targetName:
              "projects/c3t7p26j4a2g00de1sng/devices/emuc4ah9r13um94o4pp3hdg",
            eventType: "touch",
            data: {
              touch: {
                updateTime: "2021-05-16T08:13:15.361624Z",
              },
            },
            timestamp: "2021-09-14T08:16:27.517331Z",
          },
          labels: { name: "Temperature Simulator" },
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "touch");
        assert.equal(value.data.touch, true);

        validate(value.data, touchSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
