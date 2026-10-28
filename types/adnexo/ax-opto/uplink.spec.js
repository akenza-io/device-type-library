import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Adnexo ax-opto Uplink", () => {
  let measurementSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let statusSchema = null;
  let accelerationSchema = null;
  let errorSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    measurementSchema = loadSchema(`${import.meta.dirname}/measurement.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    statusSchema = loadSchema(`${import.meta.dirname}/status.schema.json`);
    accelerationSchema = loadSchema(`${import.meta.dirname}/acceleration.schema.json`);
    errorSchema = loadSchema(`${import.meta.dirname}/error.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Adnexo ax-opto measurement payload", () => {
      const data = {
        data: {
          port: 100,
          payloadHex: "c900c800c800c800b300b3000d010d011e021e0200001e00cb0a",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.763);
        assert.equal(data.batteryLevel, 70);
      });

      expectSample("measurement", measurementSchema, (data) => {
        assert.equal(data.bottomCenter, 54.2);
        assert.equal(data.bottomLeft, 26.9);
        assert.equal(data.bottomRight, 54.2);
        assert.equal(data.distance, 20.1);
        assert.equal(data.measurementType, "REGULAR_MEASUREMENT");
        assert.equal(data.middleCenter, 17.9);
        assert.equal(data.middleLeft, 17.9);
        assert.equal(data.middleRight, 26.9);
        assert.equal(data.temperature, 3);
        assert.equal(data.topCenter, 20);
        assert.equal(data.topLeft, 20);
        assert.equal(data.topRight, 20);
      });

      consume(data);
    });

    it("should decode Adnexo ax-opto acceleration payload", () => {
      const data = {
        data: {
          port: 99,
          payloadHex: "030052fc1501f80a",
        },
      };

      expectSample("acceleration", accelerationSchema, (data) => {
        assert.equal(data.accX, 3);
        assert.equal(data.accY, -942);
        assert.equal(data.accZ, 277);
      });

      consume(data);
    });

    it("should decode Adnexo ax-opto error payload", () => {
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

    it("should decode Adnexo ax-opto config payload", () => {
      const data = {
        data: {
          port: 4,
          payloadHex: "045802000005060600a30200",
        },
      };

      expectSample("lifecycle", statusSchema, (data) => {
        assert.equal(data.joinInterval, 172800);
        assert.equal(data.measurementInterval, 600);
        assert.equal(data.payloadType, "REPORT_CONFIGURATION");
        assert.equal(data.sendInterval, 6);
      });

      consume(data);
    });
  });
});
