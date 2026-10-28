import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Pure Pro uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  let humiditySchema = null;
  let pressureSchema = null;
  let illuminanceSchema = null;
  let tvocSchema = null;
  let coSchema = null;
  let co2Schema = null;
  let soundSchema = null;
  let pm2_5Schema = null;
  let pm4Schema = null;
  let pm10Schema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    pressureSchema = loadSchema(`${import.meta.dirname}/pressure.schema.json`);
    illuminanceSchema = loadSchema(`${import.meta.dirname}/illuminance.schema.json`);
    tvocSchema = loadSchema(`${import.meta.dirname}/tvoc.schema.json`);
    coSchema = loadSchema(`${import.meta.dirname}/co.schema.json`);
    co2Schema = loadSchema(`${import.meta.dirname}/co2.schema.json`);
    soundSchema = loadSchema(`${import.meta.dirname}/sound.schema.json`);
    pm2_5Schema = loadSchema(`${import.meta.dirname}/pm2_5.schema.json`);
    pm4Schema = loadSchema(`${import.meta.dirname}/pm4.schema.json`);
    pm10Schema = loadSchema(`${import.meta.dirname}/pm10.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Pure Pro (temperature,humidity,pressure,illuminance,tvoc,co,co2,sound) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "02f602460d000101081000001a15000127221a000100012200030000007d69000100116c000102797000010032",
        },
      };

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.temperature, 26.4);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 26);
      });

      expectSample("pressure", pressureSchema, (data) => {
        assert.equal(data.pressure, 1001.8);
      });

      expectSample("illuminance", illuminanceSchema, (data) => {
        assert.equal(data.illuminance, 0.01);
      });

      expectSample("tvoc", tvocSchema, (data) => {
        assert.equal(data.tvoc, 1.25);
      });

      expectSample("co", coSchema, (data) => {
        assert.equal(data.co, 1.7);
      });

      expectSample("co2", co2Schema, (data) => {
        assert.equal(data.co2, 633);
      });

      expectSample("sound", soundSchema, (data) => {
        assert.equal(data.sound, 50);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Pure Pro (PM2.5, PM4, PM10) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "02f7028325001102001d25001103001d25001104001d",
        },
      };

      expectSample("pm2_5", pm2_5Schema, (data) => {
        assert.equal(data.pm2_5, 2.9);
      });

      expectSample("pm4", pm4Schema, (data) => {
        assert.equal(data.pm4, 2.9);
      });

      expectSample("pm10", pm10Schema, (data) => {
        assert.equal(data.pm10, 2.9);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Pure Pro (PM10) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "020402f825001104001b",
        },
      };

      expectSample("pm10", pm10Schema, (data) => {
        assert.equal(data.pm10, 2.7);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Pure Pro (Illuminance, CO) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "02fc03011a0001000b697501005a",
        },
      };

      expectSample("illuminance", illuminanceSchema, (data) => {
        assert.equal(data.illuminance, 0.11);
      });

      expectSample("co", coSchema, (data) => {
        assert.equal(data.co, 9);
      });

      consume(data);
    });
  });
});
