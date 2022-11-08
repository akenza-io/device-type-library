const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Adeunis dry contact", () => {
  let channelSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/channel.schema.json`)
      .then((parsedSchema) => {
        channelSchema = parsedSchema;
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
    it("should decode the Adeunis dry contact standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "4040000100000005000201",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.frameCounter, 2);
        assert.equal(value.data.hardwareError, false);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.configurationDone, false);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "channel");
        assert.equal(value.data.channel, "channelA");
        assert.equal(value.data.previousState, false);
        assert.equal(value.data.state, true);
        assert.equal(value.data.value, 1);

        validate(value.data, channelSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "channel");
        assert.equal(value.data.channel, "channelB");
        assert.equal(value.data.previousState, false);
        assert.equal(value.data.state, false);
        assert.equal(value.data.value, 0);

        validate(value.data, channelSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "channel");
        assert.equal(value.data.channel, "channelC");
        assert.equal(value.data.previousState, false);
        assert.equal(value.data.state, false);
        assert.equal(value.data.value, 5);

        validate(value.data, channelSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "channel");
        assert.equal(value.data.channel, "channelD");
        assert.equal(value.data.previousState, false);
        assert.equal(value.data.state, false);
        assert.equal(value.data.value, 2);

        validate(value.data, channelSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
