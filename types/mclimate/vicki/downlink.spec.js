

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Vicki Downlink", () => {
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/downlink.js`);
    consume = init(script);
    done();
  });

  describe("consume()", () => {
    it("should encode the Vicki get operation mode payload", () => {
      const data = {
        payload: { getOperationalMode: true },
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.equal(value.payloadHex, "18");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 1);
      });

      consume(data);
    });

    it("should encode the Vicki set target temperature payload", () => {
      const data = {
        payload: { setTargetTemperature: 20 },
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.equal(value.payloadHex, "0e14");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 1);
      });

      consume(data);
    });

    it("should encode the Vicki set target temperature payload", () => {
      const data = {
        payload: { setOpenWindow: { "enabled": true, "closeTime": 20, "delta": 3, "motorPosition": 540 } },
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.equal(value.payloadHex, "0601041c23");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 1);
      });

      consume(data);
    });

    it("should encode a combined Vicki settings payload", () => {
      const data = {
        payload: { "setTemperatureRange": { "min": 15, "max": 21 }, "setChildLock": true }
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.equal(value.payloadHex, "080f150701");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 1);
      });

      consume(data);
    });
  });
});
