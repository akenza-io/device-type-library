import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Integra aquastream uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let alarmSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    alarmSchema = loadSchema(`${import.meta.dirname}/alarm.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Aquastream payload", () => {
      const data = {
        data: {
          payloadHex:
            "2D44B42509930310050E7221535104B4250107010000200413E02E00008410130000000002FD17000002FD74CB16",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.backflow, 0);
        assert.equal(data.volume, 12000);
        assert.equal(data.volumeM3, 12);
      });

      expectSample("alarm", alarmSchema, (data) => {
        assert.equal(data.batteryLow, false);
        assert.equal(data.burstAlarm, false);
        assert.equal(data.leak, false);
        assert.equal(data.noConsumption, false);
        assert.equal(data.overflow, false);
        assert.equal(data.reverseFlow, false);
        assert.equal(data.tamperAlarm, false);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLifetime, 5835);
        assert.equal(data.configuration, 32);
        assert.equal(data.manufacturerCode, "25B4");
        assert.equal(data.meterAddress, "04515321");
        assert.equal(data.meterVersion, 1);
        assert.equal(data.moduleNumber, "10039309");
        assert.equal(data.statusField, 0);
        assert.equal(data.systemComponent, 14);
        assert.equal(data.transmitionCounter, 1);
        assert.equal(data.versionNumber, 5);
        assert.equal(data.waterType, 7);
      });

      consume(data);
    });
  });
});
