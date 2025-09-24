

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Dragino Gro Point Air Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let soilMoistureSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/soil_moisture.schema.json`)
      .then((parsedSchema) => {
        soilMoistureSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Dragino Gro Point Air report uplink", () => {
      const data = {
        data: {
          payloadHex: "0ce73600d700d200cd00d700d200cd00d200d200d200cd00c87fff",
          port: 2,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "soil_moisture");
        assert.equal(value.data.soilMoisture1, 21.5);
        assert.equal(value.data.soilMoisture2, 21);
        assert.equal(value.data.soilMoisture3, 20.5);
        assert.equal(value.data.soilMoisture4, 21.5);
        assert.equal(value.data.soilMoisture5, 21);
        assert.equal(value.data.soilMoisture6, 20.5);

        validateSchema(value.data, soilMoistureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.303);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
