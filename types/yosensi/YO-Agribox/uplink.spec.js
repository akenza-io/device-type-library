const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO AgriBox uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/batteryVoltage.schema.json`)
      .then((parsedSchema) => {
        batteryVoltageSchema = parsedSchema;
        done();
      });
  });

  let internalTemperatureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/internalTemperature.schema.json`)
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

  let outputVoltageCH1Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/outputVoltageCH1.schema.json`)
      .then((parsedSchema) => {
        outputVoltageCH1Schema = parsedSchema;
        done();
      });
  });

  let outputVoltageCH2Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/outputVoltageCH2.schema.json`)
      .then((parsedSchema) => {
        outputVoltageCH2Schema = parsedSchema;
        done();
      });
  });

  let outputVoltageCH3Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/outputVoltageCH3.schema.json`)
      .then((parsedSchema) => {
        outputVoltageCH3Schema = parsedSchema;
        done();
      });
  });

  let outputVoltageCH4Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/outputVoltageCH4.schema.json`)
      .then((parsedSchema) => {
        outputVoltageCH4Schema = parsedSchema;
        done();
      });
  });

  let soilMoisture1Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/soilMoisture1.schema.json`)
      .then((parsedSchema) => {
        soilMoisture1Schema = parsedSchema;
        done();
      });
  });

  let soilMoisture2Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/soilMoisture2.schema.json`)
      .then((parsedSchema) => {
        soilMoisture2Schema = parsedSchema;
        done();
      });
  });

  let soilMoisture3Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/soilMoisture3.schema.json`)
      .then((parsedSchema) => {
        soilMoisture3Schema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO AgriBox payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "021b0000080001129c0d000100e41000001d440007000800030002000066001100018a660011010187660011020187",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "batteryVoltage");
        assert.equal(value.data.batteryVoltage, 4764);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internalTemperature");
        assert.equal(value.data.internalTemperature, 22.8);

        utils.validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 29);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "outputVoltageCH1");
        assert.equal(value.data.outputVoltageCH1, 8);

        utils.validateSchema(value.data, outputVoltageCH1Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "outputVoltageCH2");
        assert.equal(value.data.outputVoltageCH2, 3);

        utils.validateSchema(value.data, outputVoltageCH2Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "outputVoltageCH3");
        assert.equal(value.data.outputVoltageCH3, 2);

        utils.validateSchema(value.data, outputVoltageCH3Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "outputVoltageCH4");
        assert.equal(value.data.outputVoltageCH4, 0);

        utils.validateSchema(value.data, outputVoltageCH4Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "soilMoisture1");
        assert.equal(value.data.soilMoisture1, 3.94);

        utils.validateSchema(value.data, soilMoisture1Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "soilMoisture2");
        assert.equal(value.data.soilMoisture2, 3.91);

        utils.validateSchema(value.data, soilMoisture2Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "soilMoisture3");
        assert.equal(value.data.soilMoisture3, 3.91);

        utils.validateSchema(value.data, soilMoisture3Schema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
