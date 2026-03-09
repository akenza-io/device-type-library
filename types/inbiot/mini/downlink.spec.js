import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("inBiot MINI Downlink", () => {
  let downlinkSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/downlink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/downlink.schema.json`)
      .then((parsedSchema) => {
        downlinkSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should encode the inBiot MINI configuration payload", () => {
      const data = {
        data: {
          ledStatus: true,
          timeToSend: 10,
          resetDevice: true
        },
      };
      
      const expectedHexPayload = "01010102010a0f0101";

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
        assert.equal(value.payloadHex, expectedHexPayload);
        assert.equal(value.port, 1);
      });

      consume(data);
    });
  });
});
