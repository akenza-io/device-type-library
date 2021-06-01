const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Comtac LPN CM-2 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Comtac LPN CM-2 payload default", () => {
      const data = {
        data: {
          port: 3,
          payload_hex: "0110000a5efed419ec07d001f4044809ca154578216a",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.booster, false);
        assert.equal(value.data.txOnTimer, false);
        assert.equal(value.data.txOnEvent, false);
        assert.equal(value.data.buttonEvent, true);
        assert.equal(value.data.digitalInputEvent, false);
        assert.equal(value.data.deepSleepEvent, false);
        assert.equal(value.data.digitalInputState, false);
        assert.equal(value.data.minTempOn, false);
        assert.equal(value.data.maxTempOn, false);
        assert.equal(value.data.minHumOn, false);
        assert.equal(value.data.maxHumOn, false);
        assert.equal(value.data.minPt100On, false);
        assert.equal(value.data.maxPt100On, false);
        assert.equal(value.data.minLemOn, false);
        assert.equal(value.data.maxLemOn, false);
        assert.equal(value.data.voltage, 2.654);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, -3);
        assert.equal(value.data.humidity, 66.36);
        assert.equal(value.data.temperaturePT100, 20);
        assert.equal(value.data.adc1, 500);
        assert.equal(value.data.adc2, 1096);
        assert.equal(value.data.lem, 2.506);
        assert.equal(value.data.brightness, 21);
        validate(value.data, defaultSchema, { throwError: true });
      });
      /*
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "button_pressed");
        assert.equal(value.data.buttonPressed, true);
      });
*/
      consume(data);
    });
  });
});
