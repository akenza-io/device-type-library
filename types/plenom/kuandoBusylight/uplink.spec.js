import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Kuando busylight Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    [defaultSchema, lifecycleSchema] = await Promise.all([
      loadSchema(`${__dirname}/default.schema.json`),
      loadSchema(`${__dirname}/lifecycle.schema.json`),
    ]);
  });

  describe("consume()", () => {
    it("should decode the Kuando busylight payload", () => {
      const data = {
        data: {
          payloadHex: "a9ffffff230000000300000002000000ffff0064021f0c01",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.lastColorRGB, "255,0,255");
        assert.equal(value.data.timeOn, 100);
        assert.equal(value.data.timeOff, 2);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.rssi, -87);
        assert.equal(value.data.snr, 35);
        assert.equal(value.data.downlinksReceived, 3);
        assert.equal(value.data.uplinksSent, 2);
        assert.equal(value.data.swRevision, 31);
        assert.equal(value.data.hwRevision, 12);
        assert.equal(value.data.adrState, 1);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
