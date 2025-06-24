const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Should decode the HKT Door Sensor uplinks", () => {
  let doorSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/door.schema.json`).then((parsedSchema) => {
      doorSchema = parsedSchema;
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

  let defaultSchema = null;
  before((done) => {
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
    it("Should decode the HKT Door Sensor Version uplinks", () => {
      const data = {
        data: {
          payloadHex: "686b740001010202036408002202230800100024001e25008400",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.open, false);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.countingHours, "8:0-16:0");
        assert.equal(value.data.countingInterval, 30);
        assert.equal(value.data.hwVersion, 2);
        assert.equal(value.data.swVersion, 2);
        assert.equal(value.data.installed, true);
        assert.equal(value.data.lifecycleInterval, 24);
        assert.equal(value.data.mode, 2);

        utils.validateSchema(value.data, systemSchema, { throwError: true });
      });

      consume(data);
    });

    it("Should decode the HKT Door Sensor openings uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B74000726000C000C000001F4000001F4",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door");
        assert.equal(value.data.nrClosings, 12);
        assert.equal(value.data.nrOpenings, 12);

        assert.equal(value.data.absClosings, 500);
        assert.equal(value.data.absOpenings, 500);

        utils.validateSchema(value.data, doorSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
