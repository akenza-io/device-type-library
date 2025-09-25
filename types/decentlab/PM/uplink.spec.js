const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab PM Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    done();
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Decentlab PM payload", () => {
      const data = {
        data: {
          payloadHex:
            "021b50000f0c25002500270027002701f50107012c012d012d012d67bd618dbd10",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.humidity, 41.63221740722656);
        assert.equal(value.data.temperature, 24.35660461425781);
         assert.equal(value.data.temperatureF, 75.8);
        assert.equal(value.data.pressure, 96800);
        assert.equal(value.data.pm0_5Number, 26.3);
        assert.equal(value.data.pm10, 3.9);
        assert.equal(value.data.pm10Number, 30.1);
        assert.equal(value.data.pm1_0, 3.7);
        assert.equal(value.data.pm1_0Number, 30);
        assert.equal(value.data.pm2_5, 3.9);
        assert.equal(value.data.pm2_5Number, 30.1);
        assert.equal(value.data.pm4, 3.9);
        assert.equal(value.data.pm4Number, 30.1);
        assert.equal(value.data.typicalParticleSize, 501);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.109);
        assert.equal(value.data.deviceId, 6992);
        assert.equal(value.data.protocolVersion, 2);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});