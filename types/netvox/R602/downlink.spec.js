

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("R602 Downlink", () => {
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/downlink.js`);
    consume = init(script);
    done();
  });

  describe("consume()", () => {
    it("should encode the R602 startSiren payload", () => {
      const data = {
        payload: {
          actionType: "startWarning",
          warningMode: "DOORBELL",
          strobeMode: "LED_BLINK_2",
          duration: 3,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "9069030200030000000000");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 7);
      });

      consume(data);
    });
  });
});
