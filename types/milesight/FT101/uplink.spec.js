import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Milesight FT101 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight FT101 payload", () => {
      const data = {
        uplinkMetrics: {
          "deviceId": "string",
          "uplinkSize": 223,
          "timestamp": "iso-8601-date-string",
          "latitude": 46.928403,
          "longitude": 7.628662,
          "port": 2,
          "frameCountUp": 14,
          "frameCountDown": 1,
          "rssi": -88.0,
          "snr": 7.75,
          "sf": 7,
          "txPower": 8.0,
          "numberOfGateways": 2,
          "esp": -88.67,
          "sqi": 3
        },
        data: {
          port: 1,
          payloadHex: "0b00",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.frameCountDown, 1);
        assert.equal(data.frameCountUp, 14);
        assert.equal(data.gatewaysInRange, 2);

        assert.equal(data.rssi, -88.0);
        assert.equal(data.snr, 7.75);
        assert.equal(data.spreadingFactor, 7);
        assert.equal(data.txPower, 8.0);
      });

      consume(data);
    });
  });
});
