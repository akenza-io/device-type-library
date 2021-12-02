const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Swisscom Multisense timed event Uplink", () => {
  let timedEventSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/timed_event.schema.json`)
      .then((parsedSchema) => {
        timedEventSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Swisscom Multisense timed event payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "010080a3010945026e0300170412820503f8007cfffc",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "timed_event");
        assert.equal(value.data.payloadVersion, 1);
        assert.equal(value.data.mode, 0);
        assert.equal(value.data.voltage, 2.978);
        assert.equal(value.data.batteryLevel, 64);
        assert.equal(value.data.temperature, 23.73);
        assert.equal(value.data.humidity, 55);
        assert.equal(value.data.reedCounter, 23);
        assert.equal(value.data.motionCounter, 4738);
        assert.equal(value.data.accX, 1016);
        assert.equal(value.data.accY, 124);
        assert.equal(value.data.accZ, -4);

        validate(value.data, timedEventSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
