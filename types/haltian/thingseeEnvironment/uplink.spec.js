

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Haltian Thingsee Environment Sensor Uplink", () => {
  let environmentSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/environment.schema.json`)
      .then((parsedSchema) => {
        environmentSchema = parsedSchema;
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

  let orientationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/orientation.schema.json`)
      .then((parsedSchema) => {
        orientationSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Haltian Thingsee Environment Sensor environment payload on CHANGE", () => {
      const data = {
        data: {
          tsmId: 12100,
          tsmTuid: "TSAR02TG122043408",
          tsmTs: 1657108990,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 9,
          deploymentGroupId: "prch00switzerland",
          airp: 97021.277,
        },
      };
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "environment");
        assert.equal(value.data.pressure, 97021.277);

        validateSchema(value.data, environmentSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.reason, "CHANGE");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Haltian Thingsee Environment Sensor orientation payload", () => {
      const data = {
        data: {
          tsmId: 1111,
          tsmTuid: "TSEN01E6214703511",
          accz: 950,
          tsmTs: 1657199579,
          accy: 37,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
          accx: 307,
        },
      };
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "orientation");
        assert.equal(value.data.accX, 307);
        assert.equal(value.data.accY, 37);
        assert.equal(value.data.accZ, 950);

        validateSchema(value.data, orientationSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.reason, "TIME");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
