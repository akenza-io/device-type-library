

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Haltian Thingsee air Sensor Uplink", () => {
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

  let co2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/co2.schema.json`).then((parsedSchema) => {
      co2Schema = parsedSchema;
      done();
    });
  });

  let tvocSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/tvoc.schema.json`).then((parsedSchema) => {
      tvocSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Haltian Thingsee air Sensor environment payload on TIME", () => {
      const data = {
        data: {
          tsmId: 12100,
          tsmTuid: "TSAR02TG122043408",
          temp: 26.4,
          tsmTs: 1657109290,
          humd: 35.2,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
          airp: 97017.737,
        },
      };
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "environment");
        assert.equal(value.data.pressure, 97017.737);
        assert.equal(value.data.temperature, 26.4);
        assert.equal(value.data.humidity, 35.2);

        validateSchema(value.data, environmentSchema, {
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

    it("should decode the Haltian Thingsee air Sensor environment payload on CHANGE", () => {
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

    it("should decode the Haltian Thingsee air Sensor co2 payload", () => {
      const data = {
        data: {
          tsmId: 24100,
          tsmTuid: "TSAR02TG122043408",
          tsmTs: 1657105690,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
          carbonDioxide: 460,
          status: 0,
        },
      };
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 460);
        assert.equal(value.data.co2Status, "OK");

        validateSchema(value.data, co2Schema, { throwError: true });
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

    it("should decode the Haltian Thingsee air Sensor tvoc payload", () => {
      const data = {
        data: {
          tvoc: 10,
          tsmId: 24101,
          tsmTuid: "TSAR02TG122043408",
          tsmTs: 1657105690,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
        },
      };
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "tvoc");
        assert.equal(value.data.tvoc, 10);

        validateSchema(value.data, tvocSchema, { throwError: true });
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
