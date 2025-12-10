// test script for uplink.js decoder
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Dragino S31LB-LS Uplink", () => {
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
    // port 2
    it("should decode the Dragino S31LB-LS on port 2", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "0e1c68a2ef9b0001130191",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.alarmFlag, false);
        assert.equal(value.data.pa8, "High");
        assert.equal(value.data.temperature, 27.5);
        assert.equal(value.data.temperatureF, 81.5);
        assert.equal(value.data.humidity, 40.1);
        assert.equal(value.data.modStatus, 1);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // lifecycle test
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.612);
        assert.equal(value.data.batteryLevel, 75);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    // todo: test for port 3 and 5
  });
});
