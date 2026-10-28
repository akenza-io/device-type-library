import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys ELT-2 uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let configurationSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    configurationSchema = loadSchema(`${import.meta.dirname}/configuration.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys ELT-2 payload", () => {
      const data = {
        data: {
          payloadHex: "0100e20218070e410cff5614000edd20",
          port: 5,
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 22.6);
        assert.equal(data.humidity, 24);
        assert.equal(data.pressure, 974.112);
        assert.equal(data.externalTemperature1, -17);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.649);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });

    it("should decode Elsys ELT-2 configuration payload", () => {
      const data = {
        data: {
          payloadHex:
            "3e560701080509010a000b050c050d000e00110214000002581500000001170000000118000000011a000493e01e000000011f000000012000000000220004006425032600270028002e012f00300134003b00f53ffb0d56",
          port: 6,
        },
      };

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.ota, true);
        assert.equal(data.port, 5);
        assert.equal(data.mode, 1);
        assert.equal(data.ack, false);
        assert.equal(data.drDef, 5);
        assert.equal(data.drMax, 5);
        assert.equal(data.drMin, 0);
        assert.equal(data.class, 0);
        assert.equal(data.pirCfg, 2);
        assert.equal(data.splPer, 600);
        assert.equal(data.tempPer, 1);
        assert.equal(data.lightPer, 1);
        assert.equal(data.pirPer, 1);
        assert.equal(data.extPer, 300000);
        assert.equal(data.vddPer, 1);
        assert.equal(data.sendPer, 1);
        assert.equal(data.lock, 0);
        assert.equal(data.link, "00040064");
        assert.equal(data.plan, 3);
        assert.equal(data.subBand, 0);
        assert.equal(data.lbt, false);
        assert.equal(data.ledConfig, 0);
        assert.equal(data.qSize, 1);
        assert.equal(data.qOffset, false);
        assert.equal(data.qPurge, true);
        assert.equal(data.pirSensivity, 0);
        assert.equal(data.asr, false);
        assert.equal(data.sensor, "ERS2_EYE");
        assert.equal(data.version, 3414);
      });

      consume(data);
    });
  });
});
