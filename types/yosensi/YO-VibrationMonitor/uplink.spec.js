const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Vibration uplink", () => {
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

  let externalTemperatureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/external_temperature.schema.json`)
      .then((parsedSchema) => {
        externalTemperatureSchema = parsedSchema;
        done();
      });
  });

  let rmsAccelerationSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/rms_acceleration.schema.json`)
      .then((parsedSchema) => {
        rmsAccelerationSchema = parsedSchema;
        done();
      });
  });

  let peakAccelerationSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/peak_acceleration.schema.json`)
      .then((parsedSchema) => {
        peakAccelerationSchema = parsedSchema;
        done();
      });
  });

  let crestFactorSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/crest_factor.schema.json`)
      .then((parsedSchema) => {
        crestFactorSchema = parsedSchema;
        done();
      });
  });

  let standardDeviationSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/standard_deviation.schema.json`)
      .then((parsedSchema) => {
        standardDeviationSchema = parsedSchema;
        done();
      });
  });

  let skewnessSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/skewness.schema.json`)
      .then((parsedSchema) => {
        skewnessSchema = parsedSchema;
        done();
      });
  });

  let kurtosisSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/kurtosis.schema.json`)
      .then((parsedSchema) => {
        kurtosisSchema = parsedSchema;
        done();
      });
  });

  let rmsVelocitySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/rms_velocity.schema.json`)
      .then((parsedSchema) => {
        rmsVelocitySchema = parsedSchema;
        done();
      });
  });

  let displacementSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/displacement.schema.json`)
      .then((parsedSchema) => {
        displacementSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Vibration (battery voltage,internal temperature,relative humidity,external temperature,RMS Acceleration XYZ,Peak Acceleration XYZ) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "023f000008000110fd0d000100e7100000190d00114a00e34300150000040004000543001501000600050007",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4349);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 23.1);
        assert.equal(value.data.internalTemperatureF, 73.6);

        utils.validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 25);

        utils.validateSchema(value.data, humiditySchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "external_temperature");
        assert.equal(value.data.externalTemperature, 22.7);
        assert.equal(value.data.externalTemperatureF, 72.9);

        utils.validateSchema(value.data, externalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "rms_acceleration");
        assert.equal(value.data.rmsAccelerationX, 0.004);
        assert.equal(value.data.rmsAccelerationY, 0.004);
        assert.equal(value.data.rmsAccelerationZ, 0.005);

        utils.validateSchema(value.data, rmsAccelerationSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "peak_acceleration");
        assert.equal(value.data.peakAccelerationX, 0.006);
        assert.equal(value.data.peakAccelerationY, 0.005);
        assert.equal(value.data.peakAccelerationZ, 0.007);

        utils.validateSchema(value.data, peakAccelerationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Vibration (crest factor XYZ,standard deviation XYZ,skewness XYZ,kurtosis XYZ) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "029d0e11420015020161010f012e42001503001a001e003242001504fff900130002420015050004ffd4ffda",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "crest_factor");
        assert.equal(value.data.crestFactorX, 3.53);
        assert.equal(value.data.crestFactorY, 2.71);
        assert.equal(value.data.crestFactorZ, 3.02);

        utils.validateSchema(value.data, crestFactorSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "standard_deviation");
        assert.equal(value.data.standardDeviationX, 0.26);
        assert.equal(value.data.standardDeviationY, 0.3);
        assert.equal(value.data.standardDeviationZ, 0.5);

        utils.validateSchema(value.data, standardDeviationSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "skewness");
        assert.equal(value.data.skewnessX, -0.07);
        assert.equal(value.data.skewnessY, 0.19);
        assert.equal(value.data.skewnessZ, 0.02);

        utils.validateSchema(value.data, skewnessSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "kurtosis");
        assert.equal(value.data.kurtosisX, 0.04);
        assert.equal(value.data.kurtosisY, -0.44);
        assert.equal(value.data.kurtosisZ, -0.38);

        utils.validateSchema(value.data, kurtosisSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Vibration (rms velocity XYZ,displacement XYZ) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "0241003c4200150600090008000940001507000100010001",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "rms_velocity");
        assert.equal(value.data.rmsVelocityX, 0.09);
        assert.equal(value.data.rmsVelocityY, 0.08);
        assert.equal(value.data.rmsVelocityZ, 0.09);

        utils.validateSchema(value.data, rmsVelocitySchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "displacement");
        assert.equal(value.data.displacementX, 1);
        assert.equal(value.data.displacementY, 1);
        assert.equal(value.data.displacementZ, 1);

        utils.validateSchema(value.data, displacementSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
