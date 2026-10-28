import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Adeunis dry contact", () => {
  let channelSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    channelSchema = loadSchema(`${import.meta.dirname}/channel.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Adeunis dry contact standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "4040000100000005000201",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.frameCounter, 2);
        assert.equal(data.hardwareError, false);
        assert.equal(data.lowBattery, false);
        assert.equal(data.configurationDone, false);
      });

      expectSample("channel", channelSchema, (data) => {
        assert.equal(data.channel, "channelA");
        assert.equal(data.previousState, false);
        assert.equal(data.state, true);
        assert.equal(data.value, 1);
      });

      expectSample("channel", channelSchema, (data) => {
        assert.equal(data.channel, "channelB");
        assert.equal(data.previousState, false);
        assert.equal(data.state, false);
        assert.equal(data.value, 0);
      });

      expectSample("channel", channelSchema, (data) => {
        assert.equal(data.channel, "channelC");
        assert.equal(data.previousState, false);
        assert.equal(data.state, false);
        assert.equal(data.value, 5);
      });

      expectSample("channel", channelSchema, (data) => {
        assert.equal(data.channel, "channelD");
        assert.equal(data.previousState, false);
        assert.equal(data.state, false);
        assert.equal(data.value, 2);
      });
      consume(data);
    });
  });
});
