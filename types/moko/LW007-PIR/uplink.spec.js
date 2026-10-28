import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Moko LW007-PIR Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let shutdownSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    shutdownSchema = loadSchema(`${import.meta.dirname}/shutdown.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Moko LW007-PIR heartbeat payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex:
            "68A8359A101F8DE55F0000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.count, 0);
        assert.equal(data.humidity, 59.7);
        assert.equal(data.humidityState, "ENABLED");
        assert.equal(data.lowBattery, false);
        assert.equal(data.pir, 0);
        assert.equal(data.pirState, "NO_MOTION");
        assert.equal(data.reed, false);
        assert.equal(data.reedState, "OPEN");
        assert.equal(data.reedStatus, "ENABLED");
        assert.equal(data.temperature, 26.7);
        assert.equal(data.temperatureState, "ENABLED");
      });

      consume(data);
    });

    it("should decode the Moko LW007-PIR shutdown payload", () => {
      const data = {
        data: {
          port: 7,
          payloadHex:
            "68A838E81002",
        },
      };

      expectSample("shutdown", shutdownSchema, (data) => {
        assert.equal(data.lowBattery, false);
      });

      consume(data);
    });
  });
});
