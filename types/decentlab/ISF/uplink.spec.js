import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab ISF Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab ISF payload", () => {
      const data = {
        data: {
          payloadHex:
            "023d0100030c290bab0c3e79707a1d78437991490845997e4cacdeaa6e00000000457e415a0b59",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.alphaInner, 0.00352);
        assert.equal(data.alphaOuter, -0.05184);
        assert.equal(data.betaInner, -0.04128);
        assert.equal(data.betaOuter, -0.14816);
        assert.equal(data.heatVelocityInner, 0.144);
        assert.equal(data.heatVelocityOuter, -2.208);
        assert.equal(data.maxVoltage, 11.486);
        assert.equal(data.minVoltage, 10.862);
        assert.equal(data.sapFlow, -0.192);
        assert.equal(data.temperatureOuter, -4.36);
        assert.equal(data.tmaxInner, 35.634);
        assert.equal(data.tmaxOuter, 37.392);
        assert.equal(data.upstreamTmaxInner, 33.46);
        assert.equal(data.upstreamTmaxOuter, 35.58);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.905);
        assert.equal(data.deviceId, 15617);
        assert.equal(data.diagnostic, 0);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});