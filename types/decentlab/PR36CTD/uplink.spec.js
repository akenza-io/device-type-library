import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab PR36CTD Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab PR36CTD payload", () => {
      const data = {
        data: {
          payloadHex:
            "020a17000380079786978180060c2b",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.electricalConductivity, 0.005859375);
        assert.equal(data.pressure, 0.0008544921875);
        assert.equal(data.temperatureElectronics, 23.5234375);
        assert.equal(data.temperaturePT1000, 23.50390625);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.115);
        assert.equal(data.deviceId, 2583);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});