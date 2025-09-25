const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;
describe("Comtac LPN CM-1 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let buttonPressedSchema = null;
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
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });
  before((done) => {
    utils
      .loadSchema(`${__dirname}/button_pressed.schema.json`)
      .then((parsedSchema) => {
        buttonPressedSchema = parsedSchema;
        done();
      });
  });
  describe("consume()", () => {
    it("should decode the Comtac LPN CM-1 payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "10f1f10000000f0ab60a091379",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.booster, false);
        assert.equal(value.data.minHumOn, false);
        assert.equal(value.data.maxHumOn, false);
        assert.equal(value.data.txOnEvent, true);
        assert.equal(value.data.minTempOn, false);
        assert.equal(value.data.maxTempOn, false);
        assert.equal(value.data.minTempThreshold, -15);
        assert.equal(value.data.minTempThresholdF, 5);
        assert.equal(value.data.maxTempThreshold, -15);
        assert.equal(value.data.maxTempThresholdF, 5);
        assert.equal(value.data.minHumThreshold, 0);
        assert.equal(value.data.maxHumThreshold, 0);
        assert.equal(value.data.sendInterval, 15);
        assert.equal(value.data.batteryVoltage, 2.74);
        assert.equal(value.data.batteryLevel, 70);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 25.7);
        assert.equal(value.data.temperatureF, 78.3);
        assert.equal(value.data.humidity, 50);
        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "button_pressed");
        assert.equal(value.data.buttonPressed, true);
        utils.validateSchema(value.data, buttonPressedSchema, {
          throwError: true,
        });
      });
      consume(data);
    });
  });
});
