const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Haltian Thingsee air Sensor Uplink", () => {
  let weatherSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/weather.schema.json`)
      .then((parsedSchema) => {
        weatherSchema = parsedSchema;
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

  let co2Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/co2.schema.json`).then((parsedSchema) => {
      co2Schema = parsedSchema;
      done();
    });
  });

  let tvocSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/tvoc.schema.json`).then((parsedSchema) => {
      tvocSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Haltian Thingsee air Sensor weather payload on TIME", () => {
      const data = {
        data: {
          tsmId: 12100,
          tsmTuid: "TSAR02TG122043408",
          temp: 26.4,
          tsmTs: 1657109290,
          humd: 35.2,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
          airp: 97017.737,
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "weather");
        assert.equal(value.data.pressure, 97017.737);
        assert.equal(value.data.temperature, 26.4);
        assert.equal(value.data.humidity, 35.2);
        assert.equal(value.data.light, null);

        validate(value.data, weatherSchema, { throwError: false });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.reason, "TIME");

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Haltian Thingsee air Sensor weather payload on CHANGE", () => {
      const data = {
        data: {
          tsmId: 12100,
          tsmTuid: "TSAR02TG122043408",
          tsmTs: 1657108990,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 9,
          deploymentGroupId: "prch00switzerland",
          airp: 97021.277,
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "weather");
        assert.equal(value.data.pressure, 97021.277);
        assert.equal(value.data.temperature, null);
        assert.equal(value.data.humidity, null);
        assert.equal(value.data.light, null);

        validate(value.data, weatherSchema, { throwError: false });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.reason, "CHANGE");

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Haltian Thingsee air Sensor co2 payload", () => {
      const data = {
        data: {
          tsmId: 24100,
          tsmTuid: "TSAR02TG122043408",
          tsmTs: 1657105690,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
          carbonDioxide: 460,
          status: 0,
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 460);
        assert.equal(value.data.co2Status, "OK");

        validate(value.data, co2Schema, { throwError: false });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.reason, "TIME");

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Haltian Thingsee air Sensor tvoc payload", () => {
      const data = {
        data: {
          tvoc: 10,
          tsmId: 24101,
          tsmTuid: "TSAR02TG122043408",
          tsmTs: 1657105690,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "tvoc");
        assert.equal(value.data.tvoc, 10);

        validate(value.data, tvocSchema, { throwError: false });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.reason, "TIME");

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});