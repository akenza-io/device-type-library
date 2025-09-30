import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("AM107 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode should decode the AM107 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "01756403671001046871056a490006651c0079001400077d6704087d070009736827",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.batteryLevel, 100);
          validateSchema(value.data, lifecycleSchema, {
            throwError: true,
          });
        }
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {
          assert.equal(value.data.temperature, 27.2);
          assert.equal(value.data.temperatureF, 81);
          assert.equal(value.data.humidity, 56.5);
          assert.equal(value.data.pir, 73);
          assert.equal(value.data.light, 28);
          assert.equal(value.data.visibleInfrared, 121);
          assert.equal(value.data.infrared, 20);
          assert.equal(value.data.co2, 1127);
          assert.equal(value.data.tvoc, 7);
          assert.equal(value.data.pressure, 1008.8);

          validateSchema(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
