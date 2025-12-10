import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Digital matter Yabby Uplink", () => {
  let positionSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/position.schema.json`).then((parsedSchema) => {
      positionSchema = parsedSchema;
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
    it("should decode the digital matter Yabby payload, port 1", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0030edec003224450000de",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "position");
        assert.equal(value.data.latitude, -32);
        assert.equal(value.data.longitude, 116);
        assert.equal(value.data.inTrip, false);
        assert.equal(value.data.fixFailed, false);
        assert.equal(value.data.headingDeg, 0);
        assert.equal(value.data.speedKmph, 0);
        assert.equal(value.data.batteryVoltage, 5.55);

        validateSchema(value.data, positionSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the digital matter Yabby payload, port 3", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "8BF3DC7B9438984278B85E",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.initialBatV, 5.1);
        assert.equal(value.data.txCount, 59136);
        assert.equal(value.data.tripCount, 194336);
        assert.equal(value.data.gpsSuccesses, 10464);
        assert.equal(value.data.gpsFails, 7232);
        assert.equal(value.data.aveGpsFixS, 96);
        assert.equal(value.data.aveGpsFailS, 133);
        assert.equal(value.data.aveGpsFreshenS, 120);
        assert.equal(value.data.wakeupsPerTrip, 56);
        assert.equal(value.data.uptimeWeeks, 189);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
