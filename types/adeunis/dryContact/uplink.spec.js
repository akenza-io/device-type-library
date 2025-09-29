

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Adeunis dry contact", () => {
  let channelSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/channel.schema.json`)
      .then((parsedSchema) => {
        channelSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.frameCounter, 2);
        assert.equal(value.data.hardwareError, false);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.configurationDone, false);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "channel");
        assert.equal(value.data.channel, "channelA");
        assert.equal(value.data.previousState, false);
        assert.equal(value.data.state, true);
        assert.equal(value.data.value, 1);

        validateSchema(value.data, channelSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "channel");
        assert.equal(value.data.channel, "channelB");
        assert.equal(value.data.previousState, false);
        assert.equal(value.data.state, false);
        assert.equal(value.data.value, 0);

        validateSchema(value.data, channelSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "channel");
        assert.equal(value.data.channel, "channelC");
        assert.equal(value.data.previousState, false);
        assert.equal(value.data.state, false);
        assert.equal(value.data.value, 5);

        validateSchema(value.data, channelSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "channel");
        assert.equal(value.data.channel, "channelD");
        assert.equal(value.data.previousState, false);
        assert.equal(value.data.state, false);
        assert.equal(value.data.value, 2);

        validateSchema(value.data, channelSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
