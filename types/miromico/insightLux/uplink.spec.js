const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Miromico insight lux Uplink", () => {
  let climateSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/climate.schema.json`).then((parsedSchema) => {
      climateSchema = parsedSchema;
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

  let settingsSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/settings.schema.json`)
      .then((parsedSchema) => {
        settingsSchema = parsedSchema;
        done();
      });
  });

  let doorSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/door.schema.json`)
      .then((parsedSchema) => {
        doorSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Miromico insight lux standard payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "0a01950951e60965c9095a070283029b02c102070fc9c0f5c096800a10ea770173770187750103096501",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.co2, 643);
        assert.equal(value.data.co2_2, 667);
        assert.equal(value.data.co2_3, 705);

        assert.equal(value.data.humidity, 40.5);
        assert.equal(value.data.humidity2, 50.5);
        assert.equal(value.data.humidity3, 45);

        assert.equal(value.data.iaq, 201);
        assert.equal(value.data.iaq2, 245);
        assert.equal(value.data.iaq3, 150);

        assert.equal(value.data.iaqAccuracy, 3);
        assert.equal(value.data.iaqAccuracy2, 3);
        assert.equal(value.data.iaqAccuracy3, 2);

        assert.equal(value.data.pressure, 96234);
        assert.equal(value.data.pressure2, 96115);
        assert.equal(value.data.pressure3, 95623);

        assert.equal(value.data.temperature, 24.53);
        assert.equal(value.data.temperature2, 25.34);
        assert.equal(value.data.temperature3, 25.05);

        utils.validateSchema(value.data, climateSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.57);

        utils.validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode Miromico insight lux settings payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "0505b00404c40706000020008001090e3c00f40180510100",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "settings");
        assert.equal(value.data.adr, false);
        assert.equal(value.data.cfm, true);
        assert.equal(value.data.continousIaq, false);
        assert.equal(value.data.rptInt, false);
        assert.equal(value.data.led, true);

        assert.equal(value.data.alarmTime, 60);
        assert.equal(value.data.co2AbcPeriod, 384);
        assert.equal(value.data.co2Subsamples, 32);
        assert.equal(value.data.doorStatusTime, 86400);
        assert.equal(value.data.hallDebounce, 500);
        assert.equal(value.data.nbretrans, 7);
        assert.equal(value.data.sendCycle, 1200);
        assert.equal(value.data.transmissionInterval, 4);

        utils.validateSchema(value.data, settingsSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Miromico insight lux door payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "090b496202008e003c00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door");
        assert.equal(value.data.doorAlarm, true);
        assert.equal(value.data.openCounter, 156233);
        assert.equal(value.data.alarmCounter, 142);

        utils.validateSchema(value.data, doorSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "settings");
        assert.equal(value.data.alarmTime, 60);

        utils.validateSchema(value.data, settingsSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
