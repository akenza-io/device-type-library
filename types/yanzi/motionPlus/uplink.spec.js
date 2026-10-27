import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yanzi Motion Plus Sensor Uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  let humiditySchema = null;
  let lightSchema = null;
  let occupancySchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    lightSchema = loadSchema(`${import.meta.dirname}/light.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yanzi Motion Plus Sensor Temperature payload", () => {
      const data = {
        data: {
          values: [
            {
              resourceType: "SampleTemp",
              sampleTime: 1643364139738,
              value: 292.1,
            },
          ],
        },
      };

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.temperature, 29.21);
      });

      consume(data);
    });

    it("should decode the Yanzi Motion Plus Sensor Humidity payload", () => {
      const data = {
        data: {
          values: [
            {
              resourceType: "SampleHumidity",
              sampleTime: 1643364139747,
              value: 38.3,
            },
          ],
        },
      };

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 38.3);
      });

      consume(data);
    });

    it("should decode the Yanzi Motion Plus Sensor Motion payload", () => {
      const data = {
        data: {
          values: [
            {
              resourceType: "SampleMotion",
              sampleTime: 1643365120931,
              value: 7875,
              timeLastMotion: 1643365120931,
            },
          ],
        },
      };

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.motion, 7875);
      });

      consume(data);
    });

    it("should decode the Yanzi Motion Plus Sensor Light payload", () => {
      const data = {
        data: {
          values: [
            {
              resourceType: "SampleIlluminance",
              sampleTime: 1643364139759,
              value: 88320,
              colorTemperature: 7518,
            },
          ],
        },
      };

      expectSample("light", lightSchema, (data) => {
        assert.equal(data.light, 88.3);
        assert.equal(data.colorTemperature, 7518);
      });

      consume(data);
    });
  });
});
