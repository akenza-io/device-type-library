const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Elsys EMS uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Elsys EMS payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100e8021a0300ff3d070e360b0000000d0d010f141200",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 23.2);
        assert.equal(value.data.humidity, 26);
        assert.equal(value.data.accX, 0);
        assert.equal(value.data.accY, 0);
        assert.equal(value.data.accZ, 1);
        assert.equal(value.data.reed, true);
        assert.equal(value.data.accMotion, 20);
        assert.equal(value.data.waterleak, false);
        assert.equal(value.data.pulseAbs1, 13);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.638);
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
