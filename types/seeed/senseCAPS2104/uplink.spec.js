import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Seeed SenseCAP2104 Soil Moisture and Temperature Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP2104 Soil Moisture and Temperature Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010610a05a0000010710000000004783",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.soilHumidity, 0);
        assert.equal(value.data.soilTemperature, 23.2);
        assert.equal(value.data.soilTemperatureF, 73.8);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
