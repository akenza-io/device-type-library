

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
describe("Astraled Mantis Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });
  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });
  describe("consume()", () => {
    it("should decode Astraled Mantis payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "042a0000803f042b54ca2d41022cfa000223110001320302091109020a4601020b3d01020c9802010e00",
        },
      };
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.actPwr, 1);
        assert.equal(value.data.energy, 10.861896514892578);
        assert.equal(value.data.iaqStateInt, 0);
        assert.equal(value.data.sensorAmbientLight, 250);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.lightState, 17);
        assert.equal(value.data.temperature, 23.21);
         assert.equal(value.data.temperatureF, 73.8);
        assert.equal(value.data.humidity, 32.6);
        assert.equal(value.data.voc, 317);
        assert.equal(value.data.co2, 664);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
