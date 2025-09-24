

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Milesight FT101 Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.frameCountDown, 1);
        assert.equal(value.data.frameCountUp, 14);
        assert.equal(value.data.gatewaysInRange, 2);

        assert.equal(value.data.rssi, -88.0);
        assert.equal(value.data.snr, 7.75);
        assert.equal(value.data.spreadingFactor, 7);
        assert.equal(value.data.txPower, 8.0);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
