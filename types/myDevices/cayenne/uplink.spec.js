import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Cayenne uplink", () => {
  let accelerometerSchema = null;
  let consume = null;
  let analogSchema = null;
  let barometerSchema = null;
  let digitalSchema = null;
  let gpsSchema = null;
  let gyrometerSchema = null;
  let humiditySchema = null;
  let lightSchema = null;
  let temperatureSchema = null;
  let presenceSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    accelerometerSchema = loadSchema(`${import.meta.dirname}/accelerometer.schema.json`);
    analogSchema = loadSchema(`${import.meta.dirname}/analog.schema.json`);
    barometerSchema = loadSchema(`${import.meta.dirname}/barometer.schema.json`);
    digitalSchema = loadSchema(`${import.meta.dirname}/digital.schema.json`);
    gpsSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
    gyrometerSchema = loadSchema(`${import.meta.dirname}/gyrometer.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    lightSchema = loadSchema(`${import.meta.dirname}/light.schema.json`);
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
    presenceSchema = loadSchema(`${import.meta.dirname}/presence.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Cayenne Temperature payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "03670110056700FF",
        },
      };

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.channel, 3);
        assert.equal(data.temperature, 27.2);
      });

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.channel, 5);
        assert.equal(data.temperature, 25.5);
      });

      consume(data);
    });

    it("should decode the Cayenne Accelerometer payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "067104D2FB2E0000",
        },
      };

      expectSample("accelerometer", accelerometerSchema, (data) => {
        assert.equal(data.channel, 6);
        assert.equal(data.accX, 1.234);
        assert.equal(data.accY, -1.234);
        assert.equal(data.accZ, 0);
      });

      consume(data);
    });

    it("should decode the Cayenne GPS payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "018806765ff2960a0003e8",
        },
      };

      expectSample("gps", gpsSchema, (data) => {
        assert.equal(data.channel, 1);
        assert.equal(data.latitude, 42.3519);
        assert.equal(data.longitude, -87.9094);
        assert.equal(data.altitude, 10);
      });

      consume(data);
    });
  });
});
