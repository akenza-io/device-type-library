import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Wika Netris2 Uplink", () => {
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
    it("should decode the Wika Netris1 standard uplink", () => {
      const data = {
        device: {
          customFields: {
            rangeStart: 0,
            rangeEnd: 25,
          }
        },
        data: {
          port: 1,
          payloadHex:
            "01020311ff1220",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.channel1, 5.2675);
        assert.equal(value.data.channel2, 5.3500000000000005);
        assert.equal(value.data.delta, -0.08250000000000046);
        assert.equal(value.data.deltaReverse, 0.08250000000000046);
        assert.equal(value.data.ongoingAlarm, false);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
