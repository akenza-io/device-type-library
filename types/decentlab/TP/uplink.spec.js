

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Decentlab TP Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    done();
  });

  before((done) => {
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Decentlab TP payload", () => {
      const data = {
        data: {
          payloadHex:
            "023e3e00038abc8a928aa08a848ab38a898ac38aad8ab78a928aa1000000000000000000000afc",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperatureAtLevel0, 27.48);
        assert.equal(value.data.temperatureAtLevel1, 27.06);
        assert.equal(value.data.temperatureAtLevel10, 27.21);
        assert.equal(value.data.temperatureAtLevel11, -327.68);
        assert.equal(value.data.temperatureAtLevel12, -327.68);
        assert.equal(value.data.temperatureAtLevel13, -327.68);
        assert.equal(value.data.temperatureAtLevel14, -327.68);
        assert.equal(value.data.temperatureAtLevel15, -327.68);
        assert.equal(value.data.temperatureAtLevel2, 27.2);
        assert.equal(value.data.temperatureAtLevel3, 26.92);
        assert.equal(value.data.temperatureAtLevel4, 27.39);
        assert.equal(value.data.temperatureAtLevel5, 26.97);
        assert.equal(value.data.temperatureAtLevel6, 27.55);
        assert.equal(value.data.temperatureAtLevel7, 27.33);
        assert.equal(value.data.temperatureAtLevel8, 27.43);
        assert.equal(value.data.temperatureAtLevel9, 27.06);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.812);
        assert.equal(value.data.deviceId, 15934);
        assert.equal(value.data.protocolVersion, 2);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});