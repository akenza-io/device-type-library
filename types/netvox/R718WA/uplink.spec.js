import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Netvox R718WA uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let systemSchema = null;
  let consume = null;

  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    [defaultSchema, lifecycleSchema, systemSchema] = await Promise.all([
      loadSchema(`${__dirname}/default.schema.json`),
      loadSchema(`${__dirname}/lifecycle.schema.json`),
      loadSchema(`${__dirname}/system.schema.json`),
    ]);
  });

  describe("consume()", () => {
    it("should decode the R718WA data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "0132012400000000000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.waterLeak, false);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.6);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
