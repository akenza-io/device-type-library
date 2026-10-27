import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Netvox R712 uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the R712 data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "0101012406701A9E000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.batteryVoltage, 3.6);
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

    it("should decode the R712 version report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "0101019FFF391A9E010000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.1);
        assert.equal(data.batteryLevel, 17);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, -1.99);
        assert.equal(data.humidity, 68.14);
        assert.equal(data.lowTemperatureAlarm, true);
        assert.equal(data.highTemperatureAlarm, false);
        assert.equal(data.lowHumidityAlarm, false);
        assert.equal(data.highHumidityAlarm, false);
      });

      consume(data);
    });
  });
});
