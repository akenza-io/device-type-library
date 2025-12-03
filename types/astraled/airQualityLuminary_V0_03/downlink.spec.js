import { assert } from "chai";
import rewire from "rewire";
import { init, expectEmits } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Astraled Air Quality Luminary V0.03 Downlink", () => {
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/downlink.js`);
    consume = init(script);
    done();
  });

  describe("consume()", () => {
    it("should encode a threshold payload", () => {
      const data = {
        payload: {
          commands: [
            { type: "WRITE", target: "THRESHOLD_GOOD", value: { "co2": 800, "voc": 25000 } },
            { type: "WRITE", target: "THRESHOLD_OK", value: { "co2": 1200, "voc": 25000 } },
            { type: "WRITE", target: "THRESHOLD_BAD", value: { "co2": 2000, "voc": 25000 } },
          ]
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "44152003A8614416B004A8614417D007A861");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 1);
      });

      consume(data);
    });

    it("should read out all thresholds", () => {
      const data = {
        payload: {
          commands: [
            { type: "READ", target: "THRESHOLD_GOOD" },
            { type: "READ", target: "THRESHOLD_OK" },
            { type: "READ", target: "THRESHOLD_BAD" },
          ]
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "C015C016C017");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 1);
      });

      consume(data);
    });
  });
});
