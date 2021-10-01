const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Adeunis FTD-2 Uplink", () => {
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

  describe("consume()", () => {
    it("should decode the Adeunis FTD-2 payload", () => {
      const data = {
        data: {
          payloadHex: "BF1B45159690005345002720200FC95207",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 27);
        assert.equal(value.data.trigger, "PUSHBUTTON");
        assert.equal(value.data.latitude, 45.15969);
        assert.equal(value.data.longitude, 5.345);
        assert.equal(value.data.reception, 2);
        assert.equal(value.data.sats, 7);
        assert.equal(value.data.uplink, 32);
        assert.equal(value.data.downlink, 32);
        assert.equal(value.data.batteryVoltage, 4.041);
        assert.equal(value.data.rssi, -82);
        assert.equal(value.data.snr, 7);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
