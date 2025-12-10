import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Milesight VS351 Uplink", () => {
  let peopleFlowSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/people_flow.schema.json`).then((parsedSchema) => {
      peopleFlowSchema = parsedSchema;
      done();
    });
  });

  let climateSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/climate.schema.json`).then((parsedSchema) => {
      climateSchema = parsedSchema;
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
    it("should decode should decode the Milesight VS351 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "84CC011108110185CCE803E90301",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "people_flow");
        assert.equal(value.data.periodicCountAlarm, "THRESHOLD_ALARM");
        assert.equal(value.data.periodicCountIn, 1000);
        assert.equal(value.data.periodicCountOut, 1001);
        assert.equal(value.data.totalCountAlarm, "THRESHOLD_ALARM");
        assert.equal(value.data.totalCountIn, 4353);
        assert.equal(value.data.totalCountOut, 4360);

        validateSchema(value.data, peopleFlowSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode should decode the Milesight VS350 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "8367360101",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperatureAlarm, "THRESHOLD_ALARM");
        assert.equal(value.data.temperature, 31);

        validateSchema(value.data, climateSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
