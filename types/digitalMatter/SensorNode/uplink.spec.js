import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Digitalmatter sensor node Uplink", () => {
  let analogSchema = null;
  let consume = null;
  let digitalSchema = null;
  let gpsSchema = null;
  let humiditySchema = null;
  let inputSchema = null;
  let lifecycleSchema = null;
  let measurementSchema = null;
  let probeSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    analogSchema = loadSchema(`${import.meta.dirname}/analog.schema.json`);
    digitalSchema = loadSchema(`${import.meta.dirname}/digital.schema.json`);
    gpsSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    inputSchema = loadSchema(`${import.meta.dirname}/input.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    measurementSchema = loadSchema(`${import.meta.dirname}/measurement.schema.json`);
    probeSchema = loadSchema(`${import.meta.dirname}/probe.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Digitalmatter sensor node measurement payload", () => {
      const data = {
        data: {
          port: 130,
          payloadHex: "16706f6e6e7071283608",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.internalTemperature, 21.02);
      });

      expectSample("measurement", measurementSchema, (data) => {
        assert.equal(data.measurement3[0], 16);
        assert.equal(data.measurement3[1], 15.5);
        assert.equal(data.measurement3[2], 15);
        assert.equal(data.measurement3[3], 15);
        assert.equal(data.measurement3[4], 16);
        assert.equal(data.measurement3[5], 16.5);
      });

      consume(data);
    });

    it("should decode the Digitalmatter sensor node lifecycle payload ", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "40010206",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.firmwareMajor, 2);
        assert.equal(data.firmwareMinor, 6);
        assert.equal(data.hardwareRev, 1);
        assert.equal(data.product, 64);
      });

      consume(data);
    });
  });
});
