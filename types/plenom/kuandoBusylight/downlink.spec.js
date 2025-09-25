

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Kuando busylight Uplink", () => {
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/downlink.js`);
    consume = init(script);
    done();
  });

  describe("consume()", () => {
    it("should decode the Kuando busylight payload", () => {
      const data = {
        payload: {
          red: 12,
          green: 20,
          blue: 34,
          onDuration: 255,
          offDuration: 255,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "0c2214ffff");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 15);
      });

      consume(data);
    });
  });
});
