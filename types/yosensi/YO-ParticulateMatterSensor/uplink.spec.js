const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Particulate Matter Sensor uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/battery_voltage.schema.json`)
      .then((parsedSchema) => {
        batteryVoltageSchema = parsedSchema;
        done();
      });
  });

  let internalTemperatureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/internal_temperature.schema.json`)
      .then((parsedSchema) => {
        internalTemperatureSchema = parsedSchema;
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

  let accelerometerSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/accelerometer.schema.json`)
      .then((parsedSchema) => {
        accelerometerSchema = parsedSchema;
        done();
      });
  });

  let massConcPm1Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/mass_conc_pm1.schema.json`)
      .then((parsedSchema) => {
        massConcPm1Schema = parsedSchema;
        done();
      });
  });

  let massConcPm25Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/mass_conc_pm2_5.schema.json`)
      .then((parsedSchema) => {
        massConcPm25Schema = parsedSchema;
        done();
      });
  });

  let massConcPm4Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/mass_conc_pm4.schema.json`)
      .then((parsedSchema) => {
        massConcPm4Schema = parsedSchema;
        done();
      });
  });

  let massConcPm10Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/mass_conc_pm10.schema.json`)
      .then((parsedSchema) => {
        massConcPm10Schema = parsedSchema;
        done();
      });
  });

  let partConcPm1Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/part_conc_pm1.schema.json`)
      .then((parsedSchema) => {
        partConcPm1Schema = parsedSchema;
        done();
      });
  });

  let partConcPm25Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/part_conc_pm2_5.schema.json`)
      .then((parsedSchema) => {
        partConcPm25Schema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Particulate Matter Sensor (batteryVoltage,internalTemperature,humidity,accelerometer) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "020000000800011bb90d000100cb10000018410005fffb00120058",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 7097);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 20.3);
        assert.equal(value.data.internalTemperatureF, 68.5);

        utils.validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 24);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "accelerometer");
        assert.equal(value.data.accelerometerX, -0.5);
        assert.equal(value.data.accelerometerY, 1.8);
        assert.equal(value.data.accelerometerZ, 8.8);

        utils.validateSchema(value.data, accelerometerSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Particulate Matter Sensor (Mass Concentrations: PM1, PM2.5, PM4, PM10, Particle Concentrations: PM1, PM2.5) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "02010079250011010052250011020056250011030056250011040056240011110041240011120041",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "mass_conc_pm1");
        assert.equal(value.data.massConcPm1, 8.2);

        utils.validateSchema(value.data, massConcPm1Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "mass_conc_pm2_5");
        assert.equal(value.data.massConcPm2_5, 8.6);

        utils.validateSchema(value.data, massConcPm25Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "mass_conc_pm4");
        assert.equal(value.data.massConcPm4, 8.6);

        utils.validateSchema(value.data, massConcPm4Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "mass_conc_pm10");
        assert.equal(value.data.massConcPm10, 8.6);

        utils.validateSchema(value.data, massConcPm10Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "part_conc_pm1");
        assert.equal(value.data.partConcPm1, 65);

        utils.validateSchema(value.data, partConcPm1Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "part_conc_pm2_5");
        assert.equal(value.data.partConcPm2_5, 65);

        utils.validateSchema(value.data, partConcPm25Schema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
