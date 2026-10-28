import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";





describe("Enless 600-062 Uplink Uplink", () => {
  describe("consume()", () => {
    let defaultSchema = null;
    let consume = null;
    let lifecycleSchema = null;
    let alarmSchema = null;

    before(() => {
      consume = init(rewire(`${import.meta.dirname}/uplink.js`));
      defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
      lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
      alarmSchema = loadSchema(`${import.meta.dirname}/alarm.schema.json`);
    });

    it("should decode MCF-LW12CO2E climate payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex:
            "0144bf22870c00d7000001dd000000000001000000000000000000000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.fwVersion, 12);
        assert.equal(data.id, 83135);
        assert.equal(data.seqCounter, 135);
        assert.equal(data.type, 34);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 21.5);
        assert.equal(data.humidity, 47.7);
        assert.equal(data.luminosity, 0);
        assert.equal(data.movementDetected, false);
        assert.equal(data.msgType, "NORMAL");
        assert.equal(data.pirCount, 1);
        assert.equal(data.rbe, false);
      });

      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.humidityHigh, false);
        assert.equal(data.humidityLow, false);
        assert.equal(data.motionGuard, false);
        assert.equal(data.temperatureHigh, false);
        assert.equal(data.temperatureLow, false);
      });

      consume(data);
    });
  });
});
