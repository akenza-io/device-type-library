import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Seeed SenseCAP 2105 Soil Moisture, Temperature and EC Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let errorSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    errorSchema = loadSchema(`${import.meta.dirname}/error.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP2105 Soil Moisture, Temperature and EC Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0106105C5D000001071048A30000010C10B4000000DD0A",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.soilConductivity, 0.18);
        assert.equal(data.soilHumidity, 41.8);
        assert.equal(data.soilTemperature, 23.9);
      });

      consume(data);
    });

    it("should decode Seeed SenseCAP2105 Soil Moisture, Temperature and EC Sensor payload + invalid value", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010610E897357701071048A30000010C10B4000000DD0A",
        },
      };

      expectSample("error", errorSchema, (data) => {
        assert.equal(data.errorCode, "NO_SENSOR_RESPONSE");
        assert.equal(data.fieldName, "soilTemperature");
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.soilConductivity, 0.18);
        assert.equal(value.data.soilHumidity, 41.8);
        assert.equal(value.data.soilTemperature, null);

        // utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
