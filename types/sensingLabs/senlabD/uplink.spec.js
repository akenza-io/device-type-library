

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Senlab SenlabD uplink", () => {
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

  let startupSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/startup.schema.json`)
      .then((parsedSchema) => {
        startupSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("Should decode Senlab SenlabD payload", () => {
      const data = {
        data: {
          port: 4,
          payloadHex: "0067f110a080d5b37044020002030406030000000102",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "startup");
        assert.equal(value.data.version, "2.0.2");
        assert.equal(value.data.openDuration, 0);
        assert.equal(value.data.closeDuration, 1);

        validateSchema(value.data, startupSchema, { throwError: true });
      });

      consume(data);
    });

    it("Should decode Senlab SenlabD payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "05f503030317cfd115",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.open, false);
        assert.equal(value.data.batteryLevel, 96);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
