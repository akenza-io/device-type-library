import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys EMS uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys EMS payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100e8021a0300ff3d070e360b0000000d0d010f141200",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 23.2);
        assert.equal(data.humidity, 26);
        assert.equal(data.accX, 0);
        assert.equal(data.accY, -1);
        assert.equal(data.accZ, 61);
        assert.equal(data.reed, true);
        assert.equal(data.accMotion, 20);
        assert.equal(data.waterleak, false);
        assert.equal(data.pulseAbs1, 13);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.638);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
