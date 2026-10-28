import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Oxon Oxobutton 2 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Oxon Oxobutton 2 payload", () => {
      const data = {
        data: {
          payloadHex: "39000201006408c210b00000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.acceptsDownlinks, false);
        assert.equal(data.appMode, "GENERIC_BELL_IMAGE");
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.button1Count, 0);
        assert.equal(data.button2Count, 0);
        assert.equal(data.button3Count, 0);
        assert.equal(data.button4Count, 0);

        assert.equal(data.button1, false);
        assert.equal(data.button2, false);
        assert.equal(data.button3, false);
        assert.equal(data.button4, false);

        assert.equal(data.periodicUplink, 0);
        assert.equal(data.temperatureEvent, 1);
        assert.equal(data.ambientLightEvent, 0);
        assert.equal(data.heartbeatEvent, 0);
        assert.equal(data.humidityEvent, 0);

        assert.equal(data.periodicUplink, false);
        assert.equal(data.temperatureEvent, true);
        assert.equal(data.ambientLightEvent, false);
        assert.equal(data.heartbeatEvent, false);
        assert.equal(data.humidityEvent, false);

        assert.equal(data.light, 0);
        assert.equal(data.humidity, 42.72);
        assert.equal(data.temperature, 22.42);
      });

      consume(data);
    });
  });
});
