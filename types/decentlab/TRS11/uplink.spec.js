import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab TRS11 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab TRS11 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0210d50003463f810b0c79",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.dielectricPermittivity, 1.0259018697121183);
        assert.equal(data.soilTemperature, 26.7);
        assert.equal(data.volumetricWaterContent, 0.0019605699999999393);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.193);
        assert.equal(data.deviceId, 4309);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});