import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys Sound uplink", () => {
  let soundSchema = null;
  let consume = null;
  let noiseSchema = null;
  let lifecycleSchema = null;
  let defaultSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    soundSchema = loadSchema(`${import.meta.dirname}/sound.schema.json`);
    noiseSchema = loadSchema(`${import.meta.dirname}/noise.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys Sound payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100ee02230400bd070df615402c",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.light, 189);
        assert.equal(data.humidity, 35);
        assert.equal(data.temperature, 23.8);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.574);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("sound", soundSchema, (data) => {
        assert.equal(data.soundPeak, 64);
        assert.equal(data.soundAvg, 44);
      });

      expectSample("noise", noiseSchema, (data) => {
        assert.equal(data.soundPeak, 64);
        assert.equal(data.soundAvg, 44);
      });

      consume(data);
    });
  });
});
