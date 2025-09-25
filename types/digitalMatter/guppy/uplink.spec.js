const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital matter Guppy Uplink", () => {
  let statusSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/status.schema.json`).then((parsedSchema) => {
      statusSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the digital matter Guppy short payload, port 1", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "C382",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.inTrip, true);
        assert.equal(value.data.temperature, 25);
         assert.equal(value.data.temperatureF, 77);
        assert.equal(value.data.batteryVoltage, 3.358);

        utils.validateSchema(value.data, statusSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the digital matter Guppy long payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "C38245B1",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.inTrip, true);
        assert.equal(value.data.temperature, 25);
         assert.equal(value.data.temperatureF, 77);
        assert.equal(value.data.batteryVoltage, 3.36);

        assert.equal(value.data.inclinationDeg, 51);
        assert.equal(value.data.azimuthDeg, 265.5);
        assert.equal(value.data.downUnit[0], -0.7748);
        assert.equal(value.data.downUnit[1], 0.6293);
        assert.equal(value.data.downUnit[2], -0.06097);

        assert.equal(value.data.manDown, true);
        assert.equal(value.data.xyzAzimuthDeg[0], 354.5);
        assert.equal(value.data.xyzAzimuthDeg[1], 265.5);
        assert.equal(value.data.xyzAzimuthDeg[2], 140.9);

        assert.equal(value.data.xyzInclinationDeg[0], 140.8);
        assert.equal(value.data.xyzInclinationDeg[1], 51);
        assert.equal(value.data.xyzInclinationDeg[2], 93.5);

        utils.validateSchema(value.data, statusSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
