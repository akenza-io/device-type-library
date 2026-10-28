import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino LHT65 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let externalSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    externalSchema = loadSchema(`${import.meta.dirname}/external.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino LHT65 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "cc2c0a2901dc017fff7fff",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryStatus, "GOOD");
        assert.equal(data.connectionStatus, "CONNECTED");
        assert.equal(data.externalSensor, true);
        assert.equal(data.batteryVoltage, 3.116);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 47.6);
        assert.equal(data.temperature, 26.01);
      });

      expectSample("external", externalSchema, (data) => {
        assert.equal(data.externalTemperature, 327.67);
      });

      consume(data);
    });
  });
});
