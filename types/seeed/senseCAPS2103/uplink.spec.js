import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Seeed SenseCAP 2103 CO2, Temperature and Humidity Sensor Uplink", () => {
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
    it("should decode Seeed SenseCAP2103 CO2, Temperature and Humidity Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010410404e0d00010110106300000102101ac20000facc",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 25.36);
        assert.equal(value.data.temperatureF, 77.6);
        assert.equal(value.data.humidity, 49.69);
        assert.equal(value.data.co2, 872);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
