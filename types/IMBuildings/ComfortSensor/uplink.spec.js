import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Comfort sensor", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Comfort sensor standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01030004a30b00f7412603015f09fa0c74037900",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.co2, 889);
        assert.equal(data.humidity, 31.88);
        assert.equal(data.presence, false);
        assert.equal(data.temperature, 25.54);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.deviceStatus, 3);
        assert.equal(data.batteryVoltage, 3.51);
      });

      consume(data);
    });
  });
});
