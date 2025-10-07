import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Netvox R718LB uplink", () => {
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
    it("should decode the R718LB data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "0125012401000000000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, false);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.reedContact, true);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
