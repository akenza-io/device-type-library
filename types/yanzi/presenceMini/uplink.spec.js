const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yanzi Presence Mini Sensor Uplink", () => {
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

  let occupancySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Presence Mini Sensor Temperature payload", () => {
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

    it("should decode the Yanzi Presence Mini Sensor Motion payload", () => {
      const data = {
        data: {
          resourceType: "SampleList",
          dataSourceAddress: {
            resourceType: "DataSourceAddress",
            did: "EUI64-D0CF5EFFFE59E7B5-3-Motion",
            locationId: "312770",
            serverDid: "EUI64-0090DAFFFF007A30",
            variableName: {
              resourceType: "VariableName",
              name: "motion",
            },
            instanceNumber: 0,
          },
          list: [
            {
              resourceType: "SampleMotion",
              sampleTime: 1643365120931,
              value: 24873,
              timeLastMotion: 1643365120931,
            },
          ],
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 1);
        assert.equal(value.data.motion, 24873);

        validate(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
