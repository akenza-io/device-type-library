import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab RAD Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab RAD payload", () => {
      const data = {
        data: {
          payloadHex:
            "02586b0003074c88b68a8c00000b93",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.distance, 1868);
        assert.equal(data.temperature, 22.3);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.963);
        assert.equal(data.deviceId, 22635);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.reliability, 27);
        assert.equal(data.status, 0);
      });

      consume(data);
    });
  });
});