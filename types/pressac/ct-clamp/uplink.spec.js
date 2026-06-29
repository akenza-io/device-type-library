import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Pressac CT Clamp Uplink", () => {
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

  describe("consume()", () => {
    it("should decode the Pressac CT Clamp single channel payload", () => {
      const data = {
        data: {
          payloadHex: "0000000016040100",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.ch1Current, 0);
        assert.equal(value.data.ch2Current, 10.46);
        assert.equal(value.data.ch3Current, 0);
        assert.equal(value.data.counter, 1);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Pressac CT Clamp three channel payload", () => {
      const data = {
        data: {
          payloadHex: "7B00C801150305",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.ch1Current, 4.56);
        assert.equal(value.data.ch2Current, 7.89);
        assert.equal(value.data.ch3Current, 1.23);
        assert.equal(value.data.counter, 5);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
