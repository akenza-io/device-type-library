const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Netvox R718N3 Uplink", () => {
  let raw1Schema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/raw1.schema.json`).then((parsedSchema) => {
      raw1Schema = parsedSchema;
      done();
    });
  });

  let raw2Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/raw2.schema.json`).then((parsedSchema) => {
      raw2Schema = parsedSchema;
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

  let defaultSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let versionSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/version.schema.json`)
      .then((parsedSchema) => {
        versionSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the first raw R718N3 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "014a01243f803fb03f8001",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "raw1");

        assert.equal(value.data.current1, 16256);
        assert.equal(value.data.current2, 16304);
        assert.equal(value.data.current3, 16256);
        assert.equal(value.data.multiplier1, 1);

        validate(value.data, raw1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.batteryVoltage, 3.6);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the second raw R718N3 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "014a022401010000000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "raw2");

        assert.equal(value.data.multiplier2, 1);
        assert.equal(value.data.multiplier3, 1);

        validate(value.data, raw2Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.batteryVoltage, 3.6);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the verion R718N3 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "014a000A012017050300",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.softwareVersion, 10);
        assert.equal(value.data.hardwareVersion, 1);
        assert.equal(value.data.dataCode, "20170503");

        validate(value.data, versionSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the combined message R718N3 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "014A032405DC36B080E824",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.current1, 1.5);
        assert.equal(value.data.current2, 70);
        assert.equal(value.data.current3, 330);

        validate(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.batteryVoltage, 3.6);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
