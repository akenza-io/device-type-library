

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
describe("EGK-LW20W00 Uplink", () => {
  describe("consume()", () => {
    let distanceSchema = null;
    let consume = null;
    before((done) => {
      const script = rewire(`${__dirname}/uplink.js`);
      consume = init(script);
      loadSchema(`${__dirname}/distance.schema.json`)
        .then((parsedSchema) => {
          distanceSchema = parsedSchema;
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

    it("should decode EGK-LW20W00 distance payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "14013a52fc2c1f0c9600990064a20964",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.adc, 3103);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "distance");
        assert.equal(value.data.distance, 153);
        assert.equal(value.data.fillLevel, 100);
        assert.equal(value.data.temperature, 24.66);

        validateSchema(value.data, distanceSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode EGK-LW20W00 time_sync payload", () => {
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
