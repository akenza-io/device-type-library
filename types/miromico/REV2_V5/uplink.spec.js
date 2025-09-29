

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Miromico REV2_V5 uplink", () => {
  let statusSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/status.schema.json`).then((parsedSchema) => {
      statusSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Miromico REV2_V5 status payload", () => {
      const data = {
        data: {
          payloadHex: "0502e804000003038c27",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.usedCharges, 1256);
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.internalTemp, 39);
        assert.equal(value.data.internalTempF, 102.2);

        validateSchema(value.data, statusSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
