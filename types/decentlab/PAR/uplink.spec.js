import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab PAR Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab PAR payload", () => {
      const data = {
        data: {
          payloadHex:
            "020291000380690c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.photosyntheticallyActiveRadiation, 48.065185546875);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.deviceId, 657);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});