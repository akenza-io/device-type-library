

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("FTD Network tester", () => {
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

  let gpsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the FTD Network payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "be1a47248480008320601512100da1",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.latitude, 47.41413333333333);
        assert.equal(value.data.longitude, 8.534333333333333);
        assert.equal(value.data.satellites, 5);

        validateSchema(value.data, gpsSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 26);
        assert.equal(value.data.trigger, "PUSHBUTTON");
        assert.equal(value.data.uplink, 18);
        assert.equal(value.data.downlink, 16);
        assert.equal(value.data.batteryVoltage, 3.489);
        assert.equal(value.data.batteryLevel, 29);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
