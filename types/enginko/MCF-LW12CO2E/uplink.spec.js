

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
describe("MCF-LW12CO2E Uplink", () => {
  describe("consume()", () => {
    let climateSchema = null;
    let consume = null;
    before((done) => {
      const script = rewire(`${__dirname}/uplink.js`);
      consume = init(script);
      loadSchema(`${__dirname}/climate.schema.json`)
        .then((parsedSchema) => {
          climateSchema = parsedSchema;
          done();
        });
    });

    let lifecycleSchema = null;
    before((done) => {
      const script = rewire(`${__dirname}/uplink.js`);
      consume = init(script);
      loadSchema(`${__dirname}/lifecycle.schema.json`)
        .then((parsedSchema) => {
          lifecycleSchema = parsedSchema;
          done();
        });
    });

    let timesyncSchema = null;
    before((done) => {
      const script = rewire(`${__dirname}/uplink.js`);
      consume = init(script);
      loadSchema(`${__dirname}/time_sync.schema.json`)
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperature, 30.12);
        assert.equal(value.data.temperatureF, 86.2);
        assert.equal(value.data.humidity, 38);
        assert.equal(value.data.pressure, 1009.74);
        assert.equal(value.data.lux, 365);
        assert.equal(value.data.voc, 25);
        assert.equal(value.data.co2, 655);

        validateSchema(value.data, climateSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 98);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperature, 30.12);
        assert.equal(value.data.temperatureF, 86.2);
        assert.equal(value.data.humidity, 38);
        assert.equal(value.data.pressure, 1009.74);
        assert.equal(value.data.lux, 370);
        assert.equal(value.data.voc, 25);
        assert.equal(value.data.co2, 655);

        validateSchema(value.data, climateSchema, { throwError: true });
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
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "time_sync");
        assert.equal(value.data.syncID, "cbe38b28");
        assert.equal(value.data.syncVersion, "00.02.23");
        assert.equal(value.data.applicationType, 407);
        assert.equal(value.data.rfu, 1);

        validateSchema(value.data, timesyncSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
