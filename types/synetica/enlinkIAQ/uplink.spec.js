import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Synetica enLink IAQ Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Synetica Status IAQ report uplink", () => {
      const data = {
        data: {
          payloadHex: "0100e702330403c1050048123f5397b03f44346af9080271573f21e8a4583f4fa87c593f6db6085a3f7c90dd5b407fcbd25c409c48315d40a0dc0d5e40a1b8b25f40a1eb6f603f1e68fe420d02",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 23.1);
        assert.equal(data.pressure, 961);
        assert.equal(data.humidity, 51);
        assert.equal(data.co2, 625);
        assert.equal(data.co2e, 721.67);
        assert.equal(data.bVoc, 0.827);
        assert.equal(data.tvoc, 72);

        assert.equal(data.pm1, 0.63);
        assert.equal(data.pm2_5, 0.81);
        assert.equal(data.pm4, 0.93);
        assert.equal(data.pm10, 0.99);
        assert.equal(data.ncPm0_5, 4);
        assert.equal(data.ncPm1, 4.88);
        assert.equal(data.ncPm2_5, 5.03);
        assert.equal(data.ncPm4, 5.05);
        assert.equal(data.ncPm10, 5.06);
        assert.equal(data.pmTps, 0.62);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.33);
      });

      consume(data);
    });
  });
});
