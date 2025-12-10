import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Sentinum Febris Uplink", () => {
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

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Sentinum Febris uplink payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "112302195204e32103cd069e0100056c",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.baseId, 1);
        assert.equal(value.data.batteryVoltage, 6.482);
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.internalTemperature, 25);
        assert.equal(value.data.internalTemperatureF, 77);
        assert.equal(value.data.majorVersion, 1);
        assert.equal(value.data.minorVersion, 2);
        assert.equal(value.data.productVersion, 3);
        assert.equal(value.data.upCnt, 2);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.alarm, "YELLOW");
        assert.equal(value.data.dewPoint, 8);
        assert.equal(value.data.dewPointF, 46.4);
        assert.equal(value.data.co2, 1694);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.pressure, 973);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
