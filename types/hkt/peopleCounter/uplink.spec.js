const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Should decode the HKT Door Sensor uplinks", () => {
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

  let systemSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/system.schema.json`).then((parsedSchema) => {
      systemSchema = parsedSchema;
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
    it("Should decode the HKT Door Sensor Version uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B740001010105",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.hwVersion, 1);
        assert.equal(value.data.swVersion, 5);

        validate(value.data, systemSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor battery level uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400030364",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);

        validate(value.data, lifecycleSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor reporting pattern uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400040401",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.reportingPattern, "TIME_INTERVAL");

        validate(value.data, systemSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor threshold uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400060607D0",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.threshold, 2000);

        validate(value.data, systemSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor counter uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400070700780096000000C8000000C8",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.counterA, 120);
        assert.equal(value.data.counterB, 150);
        assert.equal(value.data.absCountA, 200);
        assert.equal(value.data.absCountB, 200);

        validate(value.data, defaultSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor infrared error uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400088301",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.infraredError, true);

        validate(value.data, systemSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor instaled uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400098400",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.instaled, false);

        validate(value.data, systemSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
