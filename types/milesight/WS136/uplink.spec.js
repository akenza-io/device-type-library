const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("WS136 & WS156 Uplink", () => {
  let buttonPressedSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/button_pressed.schema.json`)
      .then((parsedSchema) => {
        buttonPressedSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the lifecycle WS136 & WS156 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ff0bffff0101ff166592b32851010013ff090100ff0a0102",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.hardwareVersion, "1.0");
        assert.equal(value.data.powerOn, true);
        assert.equal(value.data.protocolVersion, 1);
        assert.equal(value.data.serialNumber, "6592b32851010013");
        assert.equal(value.data.softwareVersion, "1.2");

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the WS136 & WS156 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "017564ff34011800",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.batteryLevel, 100);
        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "button_pressed");

        assert.equal(value.data.buttonNumber, 1);
        assert.equal(value.data.command, 24);

        utils.validateSchema(value.data, buttonPressedSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
