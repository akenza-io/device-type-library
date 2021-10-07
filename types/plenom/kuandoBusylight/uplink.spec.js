const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Kuando busylight Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
      });
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Kuando busylight payload", () => {
      const data = {
        data: {
          payloadHex: "a9ffffff230000000300000002000000ffff0064021f0c01",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.lastColorRGB, "255,255,0");
        assert.equal(value.data.timeOn, 100);
        assert.equal(value.data.timeOff, 2);

        validate(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.rssi, -87);
        assert.equal(value.data.snr, 35);
        assert.equal(value.data.downlinksReceived, 3);
        assert.equal(value.data.uplinksSent, 2);
        assert.equal(value.data.swRevision, 31);
        assert.equal(value.data.hwRevision, 12);
        assert.equal(value.data.adrState, 1);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
