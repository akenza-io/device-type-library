const chai = require("chai");

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
          values: [
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

        utils.validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yanzi Presence Mini Sensor Motion payload", () => {
      const data = {
        state: {},
        data: {
          values: [
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
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastMotion, 24873);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.absoluteMotion, 24873);
        assert.equal(value.data.motion, 0);
        assert.equal(value.data.occupancy, 0);
        assert.equal(value.data.occupied, false);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yanzi Presence Mini Sensor Motion payload", () => {
      const data = {
        state: { lastMotion: 24800 },
        data: {
          values: [
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
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastMotion, 24873);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.absoluteMotion, 24873);
        assert.equal(value.data.motion, 73);
        assert.equal(value.data.occupancy, 2);
        assert.equal(value.data.occupied, true);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
