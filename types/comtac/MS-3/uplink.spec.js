import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Comtac LPN MS-3 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Comtac LPN MS-3 payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex:
            "1300bc001f0100ff5ffecc03b10024fff2000dffc3016300177fffffff7fffffff0000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.light, 0);
        assert.equal(data.temperature, 25.6);
        assert.equal(data.humidity, 31);
        assert.equal(data.accX, -0.161);
        assert.equal(data.accY, -0.308);
        assert.equal(data.accZ, 0.945);
        assert.equal(data.gyroX, 3.6);
        assert.equal(data.gyroY, -1.4);
        assert.equal(data.gyroZ, 1.3);
        assert.equal(data.magnX, -0.061);
        assert.equal(data.magnY, 0.355);
        assert.equal(data.magnZ, 0.023);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.rs485, false);
        assert.equal(data.gps, false);
        assert.equal(data.acc, true);
        assert.equal(data.mag, false);
        assert.equal(data.mic, false);
        assert.equal(data.bright, true);
        assert.equal(data.tempHum, true);

        assert.equal(data.txOnEvent, false);
        assert.equal(data.magActual, false);
        assert.equal(data.extCon, false);
        assert.equal(data.booster, false);
        assert.equal(data.extSupply, false);
        assert.equal(data.dip3, false);
        assert.equal(data.dip2, false);
        assert.equal(data.dip1, false);
        assert.equal(data.batteryVoltage, 2.88);
      });

      consume(data);
    });
  });
});
