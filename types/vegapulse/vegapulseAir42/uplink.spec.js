

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Vegapulse Air 42", () => {
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

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let temperatureSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
        temperatureSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Vegapulse Air payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "083FA31F152D2401042009",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "distance");
        assert.equal(value.data.distanceMm, 1274.3860483169556);
        assert.equal(value.data.distanceCm, 127.43860483169556);
        assert.equal(value.data.distanceM, 1.2743860483169556);
        assert.equal(value.data.distanceInch, 50.172679067596675);
        assert.equal(value.data.distanceFt, 4.181056588966389);
        assert.equal(value.data.sensorMeasurementUnit, "METERS");
        assert.equal(value.data.inclinationDegree, 9);

        validateSchema(value.data, distanceSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 26);

        validateSchema(value.data, temperatureSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 36);
        assert.equal(value.data.namurState, 'GOOD');

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
