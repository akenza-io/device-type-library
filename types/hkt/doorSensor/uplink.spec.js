const chai = require("chai");
const { validate } = require("jsonschema");
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

    it("Should decode the HKT Door Sensor Battery Level uplinks", () => {
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

    it("Should decode the HKT Door Sensor Door uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400030801",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.open, true);

        validate(value.data, defaultSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor mode uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400072202",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.mode, 2);

        validate(value.data, systemSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor counting hours uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B74000823090A1514",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.countingHours, "9:10-21:20");

        validate(value.data, systemSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor counting interval uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B74000724001E",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.countingInterval, 30);

        validate(value.data, systemSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT Door Sensor lifecycle interval uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400072500",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.lifecycleInterval, 24);

        validate(value.data, systemSchema, { throwError: true });
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

        validate(value.data, doorSchema, { throwError: true });
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
