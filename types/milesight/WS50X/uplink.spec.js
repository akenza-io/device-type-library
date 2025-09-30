import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("WS50X Uplink", () => {
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

  describe("consume()", () => {
    it("should decode should decode the WS50X payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FF2931",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.switch1, "OPEN");
        assert.equal(value.data.switch2, "CLOSE");
        assert.equal(value.data.switch3, "CLOSE");
        assert.equal(value.data.switch1change, true);
        assert.equal(value.data.switch2change, true);
        assert.equal(value.data.switch3change, false);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
