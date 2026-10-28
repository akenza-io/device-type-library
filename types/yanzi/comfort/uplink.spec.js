import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yanzi Comfort Sensor Uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  let humiditySchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yanzi Comfort Sensor Temperature payload", () => {
      const data = {
        data: {
          values: [
            {
              resourceType: "SampleTemp",
              sampleTime: 1643365120937,
              value: 292.405,
            },
          ],
        },
      };

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.temperature, 29.24);
      });

      consume(data);
    });

    it("should decode the Yanzi Comfort Plus Sensor Humidity payload", () => {
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
  });
});
