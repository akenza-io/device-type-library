const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Talkpool OY1110 Uplink", () => {
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

  let startupSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/startup.schema.json`)
      .then((parsedSchema) => {
        startupSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Talkpool OY1110 report uplink", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "0f2e3ccd3338d23931f5",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, -5.2);
        assert.equal(value.data.temperatureF, 22.6);
        assert.equal(value.data.humidity, 72.3);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 2.9);
        assert.equal(value.data.temperatureF, 37.2);
        assert.equal(value.data.humidity, 64.8);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 12.7);
        assert.equal(value.data.temperatureF, 54.9);
        assert.equal(value.data.humidity, 53.9);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    describe("consume()", () => {
      it("should decode the Talkpool OY1110 report uplink", () => {
        const data = {
          data: {
            port: 2,
            payloadHex: "4424ee",
          },
        };

        utils.expectEmits((type, value) => {
          assert.equal(type, "sample");
          assert.isNotNull(value);
          assert.typeOf(value.data, "object");

          assert.equal(value.topic, "default");
          assert.equal(value.data.temperature, 30.2);
          assert.equal(value.data.temperatureF, 86.4);
          assert.equal(value.data.humidity, 34);

          utils.validateSchema(value.data, defaultSchema, { throwError: true });
        });

        consume(data);
      });
    });

    describe("consume()", () => {
      it("should decode the Talkpool OY1110 uplink", () => {
        const data = {
          data: {
            port: 1,
            payloadHex: "012000",
          },
        };

        utils.expectEmits((type, value) => {
          assert.equal(type, "sample");
          assert.isNotNull(value);
          assert.typeOf(value.data, "object");

          assert.equal(value.topic, "startup");
          assert.equal(value.data.message, "STARTUP_OK");

          utils.validateSchema(value.data, startupSchema, { throwError: true });
        });

        consume(data);
      });
    });
  });
});
