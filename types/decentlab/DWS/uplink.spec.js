import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Decentlab DWS Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Decentlab DWS payload & init state", () => {
      const data = {
        state: {},
        device: {
          customFields: {
            force: 9.8067,
            underLoad: 0.0000000475,
            strain: 0.066,
          },
        },
        data: {
          payloadHex: "0203d400033bf67fff3bf60c60",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.frequency, 15350.47);
        assert.equal(value.data.weight, 11.26);
        assert.equal(value.data.weightKg, 0.0113);
        assert.equal(value.data.relativeWeightGram, 0);
        assert.equal(value.data.relativeWeightKilogramm, 0);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.168);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceId, 980);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastWeighting, 11.26);
      });

      consume(data);
    });

    it("should decode Decentlab DWS payload & give out increment", () => {
      const data = {
        state: { lastWeighting: 5 },
        device: {
          customFields: {
            force: 9.8067,
            underLoad: 0.0000000475,
            strain: 0.066,
          },
        },
        data: {
          payloadHex: "0203d400033bf67fff3bf60c60",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.frequency, 15350.47);
        assert.equal(value.data.weight, 11.26);
        assert.equal(value.data.weightKg, 0.0113);
        assert.equal(value.data.relativeWeightGram, 6.26);
        assert.equal(value.data.relativeWeightKilogramm, 0.0063);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.168);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceId, 980);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastWeighting, 11.26);
      });

      consume(data);
    });
  });
});
