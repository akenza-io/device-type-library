import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Netvox RB11E uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let occupancySchema = null;
  let consume = null;

  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    [defaultSchema, lifecycleSchema, systemSchema] = await Promise.all([
      loadSchema(`${__dirname}/default.schema.json`),
      loadSchema(`${__dirname}/lifecycle.schema.json`),
      loadSchema(`${__dirname}/occupancy.schema.json`),
    ]);
  });

  describe("consume()", () => {
    it("should decode the R718LB data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "010301220A2800B4010000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.isObject(value.data);
        assert.equal(value.data.batteryVoltage, 3.4);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.isObject(value.data);
        assert.equal(value.data.temperature, 26);
        assert.equal(value.data.light, 180);
        assert.equal(value.data.alarm, false);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "occupancy");
        assert.isObject(value.data);
        assert.equal(value.data.occupied, true);
        validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
