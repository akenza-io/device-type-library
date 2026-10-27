import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Netvox R718A uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the R718A data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "010b012409981080000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 24.56);
        assert.equal(data.humidity, 42.24);
        assert.equal(data.lowTemperatureAlarm, false);
        assert.equal(data.highTemperatureAlarm, false);
        assert.equal(data.lowHumidityAlarm, false);
        assert.equal(data.highHumidityAlarm, false);
      });

      consume(data);
    });

    it("should decode the R718A version report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "010B012406701A9E000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 16.48);
        assert.equal(data.humidity, 68.14);
        assert.equal(data.lowTemperatureAlarm, false);
        assert.equal(data.highTemperatureAlarm, false);
        assert.equal(data.lowHumidityAlarm, false);
        assert.equal(data.highHumidityAlarm, false);
      });

      consume(data);
    });
  });
});
