import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Milesight GS601 Uplink", () => {
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

  let alertSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/alert.schema.json`)
      .then((parsedSchema) => {
        alertSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight GS601 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01000302000502000702000A020B43020D30000F001100",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.vapingIndex, 0);
        assert.equal(value.data.humidity, 57.9);
        assert.equal(value.data.pm1, 2);
        assert.equal(value.data.pm2_5, 2);
        assert.equal(value.data.pm10, 2);
        assert.equal(value.data.tvoc, 48);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alert");
        assert.equal(value.data.buzzer, "NORMAL");
        assert.equal(value.data.tamperStatus, "NORMAL");
        assert.equal(value.data.temperatureAlarm, "OVER_RANGE_ERROR");

        validateSchema(value.data, alertSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
