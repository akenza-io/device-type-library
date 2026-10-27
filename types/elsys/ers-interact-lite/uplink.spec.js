import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Elsys ERS Interact Lite uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys ERS interact lite lifecycle payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "010106021e070e3e2200fa",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 30);
        assert.equal(data.temperature, 26.2);
        assert.equal(data.targetTemperature, 25);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastTemperature, 26.2);
        assert.equal(value.lastHumidity, 30);
      });


      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.646);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });

    it("should decode Elsys ERS interact lite change payload and repeat known samples", () => {
      const data = {
        state: {
          lastTemperature: 26.2,
          lastHumidity: 30
        },
        data: {
          port: 5,
          payloadHex: "2200b4",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 26.2);
        assert.equal(data.targetTemperature, 18);
        assert.equal(data.humidity, 30);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastTemperature, 26.2);
        assert.equal(value.lastHumidity, 30);
      });

      consume(data);
    });
  });
});
