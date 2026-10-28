import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Adnexo ax-dist Uplink", () => {
  let measurementSchema = null;
  let consume = null;
  let invalidMeasurementSchema = null;
  let lifecycleSchema = null;
  let statusSchema = null;
  let errorSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    measurementSchema = loadSchema(`${import.meta.dirname}/measurement.schema.json`);
    invalidMeasurementSchema = loadSchema(`${import.meta.dirname}/invalid_measurement.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    statusSchema = loadSchema(`${import.meta.dirname}/status.schema.json`);
    errorSchema = loadSchema(`${import.meta.dirname}/error.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Adnexo ax-dist measurement payload", () => {
      const data = {
        device: {
          customFields: {
            containerHeight: 600,
            installationOffset: 0,
          },
        },
        data: {
          port: 100,
          payloadHex: "340Adc008A0C",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.21);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("measurement", measurementSchema, (data) => {
        assert.equal(data.distance, 261.2);
        assert.equal(data.fillLevel, 56);
        assert.equal(data.measurementType, "REGULAR_MEASUREMENT");
        assert.equal(data.temperature, 22);
      });

      consume(data);
    });

    it("should decode Adnexo ax-dist invalid measurement payload", () => {
      const data = {
        data: {
          port: 104,
          payloadHex: "340A7102dc008A0C",
        },
      };

      expectSample("invalid_measurement", invalidMeasurementSchema, (data) => {
        assert.equal(data.measurementVariance, 62.5);
      });

      consume(data);
    });

    it("should decode Adnexo ax-dist error payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "045802000005060600a30200",
        },
      };

      expectSample("error", errorSchema, (data) => {
        assert.equal(data.errorOn, "PARAM_READ");
        assert.equal(data.errorCode, "PARAM_NOT_READABLE");
      });

      consume(data);
    });

    it("should decode Adnexo ax-dist config payload", () => {
      const data = {
        data: {
          port: 4,
          payloadHex: "045802000005060600a30200",
        },
      };

      expectSample("status", statusSchema, (data) => {
        assert.equal(data.joinInterval, 172800);
        assert.equal(data.measurementInterval, 600);
        assert.equal(data.payloadType, "REPORT_CONFIGURATION");
        assert.equal(data.sendInterval, 6);
      });

      consume(data);
    });
  });
});
