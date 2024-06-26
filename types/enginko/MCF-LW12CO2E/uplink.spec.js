const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;
describe("MCF-LW12CO2E Uplink", () => {
  describe("consume()", () => {
    let climateSchema = null;
    let consume = null;
    before((done) => {
      const script = rewire("./uplink.js");
      consume = utils.init(script);
      utils
        .loadSchema(`${__dirname}/climate.schema.json`)
        .then((parsedSchema) => {
          climateSchema = parsedSchema;
          done();
        });
    });

    let lifecycleSchema = null;
    before((done) => {
      const script = rewire("./uplink.js");
      consume = utils.init(script);
      utils
        .loadSchema(`${__dirname}/lifecycle.schema.json`)
        .then((parsedSchema) => {
          lifecycleSchema = parsedSchema;
          done();
        });
    });

    let timesyncSchema = null;
    before((done) => {
      const script = rewire("./uplink.js");
      consume = utils.init(script);
      utils
        .loadSchema(`${__dirname}/time_sync.schema.json`)
        .then((parsedSchema) => {
          timesyncSchema = parsedSchema;
          done();
        });
    });

    it("should decode MCF-LW12CO2E climate payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex:
            "0ee040f62ac40b4c6e8a016d0119008f02e040f62ac40b4c6e8a01720119008f0262",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperature, 30.12);
        assert.equal(value.data.humidity, 38);
        assert.equal(value.data.pressure, 1009.74);
        assert.equal(value.data.lux, 365);
        assert.equal(value.data.voc, 25);
        assert.equal(value.data.co2, 655);

        utils.validateSchema(value.data, climateSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 98);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperature, 30.12);
        assert.equal(value.data.humidity, 38);
        assert.equal(value.data.pressure, 1009.74);
        assert.equal(value.data.lux, 370);
        assert.equal(value.data.voc, 25);
        assert.equal(value.data.co2, 655);

        utils.validateSchema(value.data, climateSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode MCF-LW12CO2E time_sync payload", () => {
      const data = {
        data: {
          port: 2,

          payloadHex: "01cbe38b28000223040701",
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "time_sync");
        assert.equal(value.data.syncID, "cbe38b28");
        assert.equal(value.data.syncVersion, "00.02.23");
        assert.equal(value.data.applicationType, 407);
        assert.equal(value.data.rfu, 1);

        utils.validateSchema(value.data, timesyncSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
