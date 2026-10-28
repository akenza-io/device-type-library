import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab GMM Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab GMM payload", () => {
      const data = {
        data: {
          payloadHex:
            "02532b00038726892081148297a57380cf81700bbc",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 27.6);
        assert.equal(data.temperature, 23.36);
        assert.equal(data.pressure, 95.87);
        assert.equal(data.co2, 663);
        assert.equal(data.dewPoint, 3.68);
        assert.equal(data.photosyntheticallyActiveRadiation, 183);
        assert.equal(data.vaporPressureDeficit, 2.07);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.004);
        assert.equal(data.deviceId, 21291);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});