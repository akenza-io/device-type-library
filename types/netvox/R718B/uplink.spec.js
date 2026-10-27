import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Netvox R718B uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the R718B data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "01950124FF3D0000000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.batteryVoltage, 3.6);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, -19.5);
        assert.equal(data.lowTemperatureAlarm, false);
        assert.equal(data.highTemperatureAlarm, false);
      });

      consume(data);
    });

    it("should decode the R712 version report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "0195019F019A0000000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.1);
        assert.equal(data.batteryLevel, 17);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 41);
        assert.equal(data.lowTemperatureAlarm, false);
        assert.equal(data.highTemperatureAlarm, false);
      });

      consume(data);
    });
  });
});
