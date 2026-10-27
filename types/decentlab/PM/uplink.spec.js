import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab PM Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab PM payload", () => {
      const data = {
        data: {
          payloadHex:
            "021b50000f0c25002500270027002701f50107012c012d012d012d67bd618dbd10",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 41.63221740722656);
        assert.equal(data.temperature, 24.35660461425781);
        assert.equal(data.pressure, 96800);
        assert.equal(data.pm0_5Number, 26.3);
        assert.equal(data.pm10, 3.9);
        assert.equal(data.pm10Number, 30.1);
        assert.equal(data.pm1_0, 3.7);
        assert.equal(data.pm1_0Number, 30);
        assert.equal(data.pm2_5, 3.9);
        assert.equal(data.pm2_5Number, 30.1);
        assert.equal(data.pm4, 3.9);
        assert.equal(data.pm4Number, 30.1);
        assert.equal(data.typicalParticleSize, 501);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.109);
        assert.equal(data.deviceId, 6992);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});