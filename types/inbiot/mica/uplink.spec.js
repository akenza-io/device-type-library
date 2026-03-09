import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("inBiot MICA Uplink", () => {
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
    it("should decode the inBiot MICA sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0100de0207032f000200000001000100010001ffffffffffff00024d494341003440314fffff",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.type, "MICA");
        assert.equal(value.data.temperature, 22.2);
        assert.equal(value.data.humidity, 51.9);
        assert.equal(value.data.co2, 815);
        assert.equal(value.data.tvoc, 0);
        assert.equal(value.data.pm2_5, 1);
        assert.equal(value.data.pm10, 1);
        assert.equal(value.data.vIndex, 52);
        assert.equal(value.data.tIndex, 64);
        assert.equal(value.data.virusIndex, 49);
        assert.equal(value.data.iaqIndex, 79);
        assert.equal(value.data.moldIndex, "Calculating");
        assert.equal(value.data.dB, "Preheating");
        assert.equal(value.data.counter, 2);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
