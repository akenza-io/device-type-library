import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("EMU Professional Uplink", () => {
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
    it("should decode the startup payload", () => {
      const data = {
        state: {},
        data: {
          "port": 100,
          "payloadHex": "689ba862f105041522f702f30500f40500f56400f66400f80200020265"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.totalActivePowerKWh, 12970);
        assert.equal(value.data.incrementActivePowerKWh, 0);

        validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });
      consume(data);
    });
  });
});
