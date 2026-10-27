import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab BLG Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab BLG payload", () => {
      const data = {
        data: {
          payloadHex:
            "0230c50003a40c00810c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 22.028848392450755);
        assert.equal(data.thermistorResistance, 115020.68221552655);
        assert.equal(data.voltageRatio, 0.006409406661987305);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.deviceId, 12485);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});