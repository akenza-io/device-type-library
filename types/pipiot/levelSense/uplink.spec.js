import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Pipiot levelSense uplink", () => {
  let extSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/ext.schema.json`).then((parsedSchema) => {
      extSchema = parsedSchema;
      done();
    });
  });

  let defaultSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Pipiot levelSense payload", () => {
      const data = {
        data: {
          payloadHex: "3000001060d701d219049d02",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.ultrasonicDistanceExt, 838);
        assert.equal(value.data.laserDistanceExt, 43);

        validateSchema(value.data, extSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.laserReflectance, 119296);
        assert.equal(value.data.temperature, 25);
        assert.equal(value.data.temperatureF, 77);
        assert.equal(value.data.tiltAngle, 4);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
