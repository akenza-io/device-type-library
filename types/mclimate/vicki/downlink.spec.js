import { assert } from "chai";
import rewire from "rewire";
import { init, expectEmits } from "test-utils";

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

    const encodings = [
      [{ setInternalAlgoParams: { period: 20, pFirstLast: 17, pNext: 17 } }, "0c141111"],
      [{ setTargetTemperature: 21.5 }, "5100d7"],
      [{ setTargetTemperatureAndMotorPosition: { motorPosition: 540, targetTemperature: 21 } }, "31021c15"],
      [{ setExternalTemperatureFloat: 21.3 }, "3c00d5"],
      [{ setTempHysteresis: 0.3 }, "4303"],
      [{ setOpenWindowPrecisely: { enabled: true, duration: 20, delta: 1.3 } }, "4501040d"],
      [{ setJoinRetryPeriod: 10 }, "1078"],
    ];

    encodings.forEach(([payload, payloadHex]) => {
      it(`should encode the Vicki ${Object.keys(payload)[0]} payload`, () => {
        expectEmits((type, value) => {
          assert.equal(type, "downlink");
          assert.equal(value.payloadHex, payloadHex);
          assert.equal(value.confirmed, true);
          assert.equal(value.port, 1);
        });

        consume({ payload });
      });
    });

    it("should encode an unconfirmed Vicki downlink", () => {
      const data = {
        payload: { getChildLock: true },
        confirmed: false,
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.equal(value.payloadHex, "14");
        assert.equal(value.confirmed, false);
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
