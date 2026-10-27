import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab OPTOD Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab OPTOD payload", () => {
      const data = {
        data: {
          payloadHex:
            "02186c000300008862a618836583650c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.oxygenConcentration, 8.69);
        assert.equal(data.oxygenConcentrationAlt, 8.69);
        assert.equal(data.oxygenSaturation, 97.52);
        assert.equal(data.temperature, 21.46);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.deviceId, 6252);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.status, 0);
      });

      consume(data);
    });
  });
});