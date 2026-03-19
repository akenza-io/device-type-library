

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Gavazzi UWPA/UWPM", () => {
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
    it("should decode the Gavazzi UWPA/UWPM uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "01911409000092f000000093cc7400003ca247000000000000ff460001010a00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.l2V, 232.4);
        assert.equal(value.data.l2A, 0.24);
        assert.equal(value.data.l2KW, 0.0299);
        assert.equal(value.data.totalKWh, 1833.8);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
