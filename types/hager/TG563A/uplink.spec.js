import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Should decode the TG563A uplinks", () => {
  let configSchema = null;
  let consume = null;
  let defaultSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    configSchema = loadSchema(`${import.meta.dirname}/config.schema.json`);
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("Should decode the HKT Door Sensor Version uplinks", () => {
      const data = {
        data: {
          payloadHex: "0f7e1c0300ce300200009e32d732f11400003400000000160000000009000000151d05",
        },
      };

      expectSample("config", configSchema, (data) => {
        assert.equal(data.longTelegramEnabled, true);
        assert.equal(data.majorFaultsAlertEnabled, true);
        assert.equal(data.minorFaultsAlertEnabled, true);
        assert.equal(data.periodicity, 24);
        assert.equal(data.smokeAlertEnabled, true);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.batteryFault, false);
        assert.equal(data.aacFault, false);
        assert.equal(data.aacInactive, false);
        assert.equal(data.dayMode, true);
        assert.equal(data.foulingSmokeFault, false);
        assert.equal(data.frameType, "LONG_PERIODIC_TELEGRAM");
        assert.equal(data.hwIrAntimaskFault, false);
        assert.equal(data.hwUsAntimaskFault, false);
        assert.equal(data.irAntimask, false);
        assert.equal(data.mounted, true);
        assert.equal(data.smokeAlarm, false);
        assert.equal(data.temperature, 28);
        assert.equal(data.tempOutOfRange, false);
        assert.equal(data.mounted, true);
        assert.equal(data.tooLongUnmounted, false);
        assert.equal(data.usAntimask, false);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.06);
        assert.equal(data.installationDate, '2053-12-50');
        assert.equal(data.productionDate, '2039-08-50');
        assert.equal(data.serialNumber, "00000230");
        assert.equal(data.version, 0);
      });

      consume(data);
    });
  });
});
