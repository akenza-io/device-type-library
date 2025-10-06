
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Netvox R718N3 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
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

  let versionSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/version.schema.json`)
      .then((parsedSchema) => {
        versionSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the first raw R718N3 payload", () => {
      const data = {
        state: {},
        data: {
          port: 1,
          payloadHex: "014a01243f803fb03f8001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");

        assert.equal(value.current1, 16256);
        assert.equal(value.current2, 16304);
        assert.equal(value.current3, 16256);
        assert.equal(value.multiplier1, 1);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.batteryVoltage, 3.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the second raw R718N3 payload", () => {
      const data = {
        state: {
          current1: 16256,
          current2: 16304,
          current3: 16256,
          multiplier1: 1,
        },
        data: {
          port: 1,
          payloadHex: "014a022401010000000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.current1, 16.256);
        assert.equal(value.data.current2, 16.304);
        assert.equal(value.data.current3, 16.256);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.batteryVoltage, 3.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the verion R718N3 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "014a000A012017050300",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.softwareVersion, 10);
        assert.equal(value.data.hardwareVersion, 1);
        assert.equal(value.data.dataCode, "20170503");

        validateSchema(value.data, versionSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the combined message R718N3 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "014A032405DC36B080E824",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.current1, 1.5);
        assert.equal(value.data.current2, 70);
        assert.equal(value.data.current3, 330);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.batteryVoltage, 3.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
