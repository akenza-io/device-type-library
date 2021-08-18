const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;
describe("MCF-LW12CO2E Uplink", () => {
  describe("consume()", () => {
    let co2Schema = null;
    let consume = null;
    before((done) => {
      const script = rewire("./uplink.js");
      consume = utils.init(script);
      utils.loadSchema(`${__dirname}/co2.schema.json`).then((parsedSchema) => {
        co2Schema = parsedSchema;
        done();
      });
    });
    it("should decode MCF-LW12CO2E co2 payload", () => {
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

        assert.equal(value.topic, "co2");
        assert.equal(value.data.date, "2021-07-22T06:07:00.000Z");
        assert.equal(value.data.temperature, 30.12);
        assert.equal(value.data.humidity, 38);
        assert.equal(value.data.pressure, 1009.74);
        assert.equal(value.data.lux, 370);
        assert.equal(value.data.voc, 25);
        assert.equal(value.data.co2, 655);
        assert.equal(value.data.batteryLevel, 98);
        assert.equal(value.data.rfu, 0);

        validate(value.data, co2Schema, { throwError: true });
      });
      consume(data);
    });
  });

  describe("consume()", () => {
    let timesyncSchema = null;
    let consume = null;
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

        validate(value.data, timesyncSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
