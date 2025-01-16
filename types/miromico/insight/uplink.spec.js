const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Miromico insight Uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/temperature.schema.json`).then((parsedSchema) => {
      temperatureSchema = parsedSchema;
      done();
    });
  });

  let humiditySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/humidity.schema.json`)
      .then((parsedSchema) => {
        humiditySchema = parsedSchema;
        done();
      });
  });

  let co2Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/co2.schema.json`)
      .then((parsedSchema) => {
        co2Schema = parsedSchema;
        done();
      });
  });

  let iaqSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/iaq.schema.json`)
      .then((parsedSchema) => {
        iaqSchema = parsedSchema;
        done();
      });
  });

  let pressureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/pressure.schema.json`)
      .then((parsedSchema) => {
        pressureSchema = parsedSchema;
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
    it("should decode Miromico insight standard payload without lastSample timestamp", () => {
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

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 24.53);

        utils.validateSchema(value.data, temperatureSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 40.5);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 643);

        utils.validateSchema(value.data, co2Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "iaq");
        assert.equal(value.data.iaq, 201);

        utils.validateSchema(value.data, iaqSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pressure");
        assert.equal(value.data.pressure, 96234);

        utils.validateSchema(value.data, pressureSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        // assert.equal(value.lastTemperatureSample, new Date().timestamp);
        // assert.equal(value.lastCo2Sample, new Date().timestamp);
        // assert.equal(value.lastIaqSample, new Date().timestamp);
        // assert.equal(value.lastPressureSample, new Date().timestamp);
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

    it("should decode Miromico insight standard payload with lastSample timestamp", () => {
      const data = {
        state: {
          lastTemperatureSample: new Date().setHours(new Date().getHours() - 1),
          lastCo2Sample: new Date().setHours(new Date().getHours() - 1),
          lastIaqSample: new Date().setHours(new Date().getHours() - 1),
          lastPressureSample: new Date().setHours(new Date().getHours() - 1)
        },
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

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 24.53);

        utils.validateSchema(value.data, temperatureSchema, { throwError: true }); // Now
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 25.34);

        utils.validateSchema(value.data, temperatureSchema, { throwError: true }); // Now -20 min
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 25.05);

        utils.validateSchema(value.data, temperatureSchema, { throwError: true }); // Now -40 min
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 40.5);

        utils.validateSchema(value.data, humiditySchema, { throwError: true }); // Now
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 50.5);

        utils.validateSchema(value.data, humiditySchema, { throwError: true }); // Now -20 min
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 45);

        utils.validateSchema(value.data, humiditySchema, { throwError: true }); // Now -40 min
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 643);

        utils.validateSchema(value.data, co2Schema, { throwError: true }); // Now
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 667);

        utils.validateSchema(value.data, co2Schema, { throwError: true }); // Now -20 min
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 705);

        utils.validateSchema(value.data, co2Schema, { throwError: true }); // Now -40 min
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "iaq");
        assert.equal(value.data.iaq, 201);

        utils.validateSchema(value.data, iaqSchema, { throwError: true }); // Now
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "iaq");
        assert.equal(value.data.iaq, 245);

        utils.validateSchema(value.data, iaqSchema, { throwError: true }); // Now -20 min
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "iaq");
        assert.equal(value.data.iaq, 150);

        utils.validateSchema(value.data, iaqSchema, { throwError: true }); // Now -40 min
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pressure");
        assert.equal(value.data.pressure, 96234);

        utils.validateSchema(value.data, pressureSchema, { throwError: true }); // Now 
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pressure");
        assert.equal(value.data.pressure, 96115);

        utils.validateSchema(value.data, pressureSchema, { throwError: true }); // Now -20 min
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pressure");
        assert.equal(value.data.pressure, 95623);

        utils.validateSchema(value.data, pressureSchema, { throwError: true }); // Now -40 min
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        // assert.equal(value.lastTemperatureSample, new Date().timestamp);
        // assert.equal(value.lastCo2Sample, new Date().timestamp);
        // assert.equal(value.lastIaqSample, new Date().timestamp);
        // assert.equal(value.lastPressureSample, new Date().timestamp);
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

    it("should decode Miromico insight settings payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "0505b00404c40706000020008001090e3c00f40180510100",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
      });

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

    it("should decode Miromico insight door payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex:
            "090b496202008e003c00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
      });

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
