const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Temperature Sensor Uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
        temperatureSchema = parsedSchema;
        done();
      });
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
              samples: [
                { value: 24, sampleTime: "2021-09-14T08:16:27.517331Z" },
              ],
            },
          },
          timestamp: "2021-09-14T08:16:27.517331Z",
          labels: { name: "Temperature Simulator" },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 24);

        validate(value.data, temperatureSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
