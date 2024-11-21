const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Oxon Oxobutton 2 Uplink", () => {
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
    it("should decode the Oxon Oxobutton 2 payload", () => {
      const data = {
        data: {
          payloadHex: "39000201006408c210b00000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acceptsDownlinks, false);
        assert.equal(value.data.appMode, "GENERIC_BELL_IMAGE");
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.button1, 0);
        assert.equal(value.data.button2, 0);
        assert.equal(value.data.button3, 0);
        assert.equal(value.data.button4, 0);

        assert.equal(value.data.periodicUplink, 0);
        assert.equal(value.data.temperatureEvent, 1);
        assert.equal(value.data.ambientLightEvent, 0);
        assert.equal(value.data.heartbeatEvent, 0);
        assert.equal(value.data.humidityEvent, 0);


        assert.equal(value.data.light, 0);
        assert.equal(value.data.humidity, 42.72);
        assert.equal(value.data.temperature, 22.42);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
