import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab LP8P Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab LP8P payload", () => {
      const data = {
        data: {
          payloadHex:
            "020578000f67bd618d1cedbd1081d981f4895b0bd80bb50000959895390c25",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 24.36);
        assert.equal(data.humidity, 41.63);
        assert.equal(data.barometricTemperature, 24.05);
        assert.equal(data.pressure, 968);
        assert.equal(data.co2, 473);
        assert.equal(data.co2LPF, 500);
        assert.equal(data.co2Temperature, 23.95);
        assert.equal(data.capacitorVoltage1, 3.032);
        assert.equal(data.capacitorVoltage2, 2.997);
        assert.equal(data.rawIr, 38296);
        assert.equal(data.rawIrLPF, 38201);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.11);
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceID, 1400);
        assert.equal(data.co2SensorStatus, 0);
      });

      consume(data);
    });
  });
});
