const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yanzi Comfort Sensor Uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
        temperatureSchema = parsedSchema;
        done();
      });
  });

  let humiditySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/humidity.schema.json`)
      .then((parsedSchema) => {
        humiditySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yanzi Comfort Sensor Temperature payload", () => {
      const data = {
        data: {
          resourceType: "SampleList",
          dataSourceAddress: {
            resourceType: "DataSourceAddress",
            did: "EUI64-D0CF5EFFFE59E7B5-4-Temp",
            locationId: "312770",
            serverDid: "EUI64-0090DAFFFF007A30",
            variableName: {
              resourceType: "VariableName",
              name: "temperatureK",
            },
            instanceNumber: 0,
          },
          list: [
            {
              resourceType: "SampleTemp",
              sampleTime: 1643365120937,
              value: 292.405,
            },
          ],
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 29.24);

        validate(value.data, temperatureSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yanzi Comfort Plus Sensor Humidity payload", () => {
      const data = {
        data: {
          resourceType: "SampleList",
          dataSourceAddress: {
            resourceType: "DataSourceAddress",
            did: "EUI64-0080E10300050834-3-Humd",
            locationId: "312770",
            serverDid: "EUI64-0090DAFFFF007A30",
            variableName: {
              resourceType: "VariableName",
              name: "relativeHumidity",
            },
            instanceNumber: 0,
          },
          list: [
            {
              resourceType: "SampleHumidity",
              sampleTime: 1643364139747,
              value: 38.3,
            },
          ],
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 38.3);

        validate(value.data, humiditySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
