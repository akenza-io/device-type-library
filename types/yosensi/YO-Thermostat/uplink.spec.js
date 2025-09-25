const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Thermostat uplink", () => {
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

  let illuminanceSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/illuminance.schema.json`)
      .then((parsedSchema) => {
        illuminanceSchema = parsedSchema;
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

  let presenceCounterSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/presence_counter.schema.json`)
      .then((parsedSchema) => {
        presenceCounterSchema = parsedSchema;
        done();
      });
  });

  let comfortSetpointSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/comfort_setpoint.schema.json`)
      .then((parsedSchema) => {
        comfortSetpointSchema = parsedSchema;
        done();
      });
  });

  let standbyOffsetSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/standby_offset.schema.json`)
      .then((parsedSchema) => {
        standbyOffsetSchema = parsedSchema;
        done();
      });
  });

  let economyOffsetSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/economy_offset.schema.json`)
      .then((parsedSchema) => {
        economyOffsetSchema = parsedSchema;
        done();
      });
  });

  let frostProtSetpointSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/frost_prot_setpoint.schema.json`)
      .then((parsedSchema) => {
        frostProtSetpointSchema = parsedSchema;
        done();
      });
  });

  let operationModeSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/operation_mode.schema.json`)
      .then((parsedSchema) => {
        operationModeSchema = parsedSchema;
        done();
      });
  });

  let getParametersSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/get_parameters.schema.json`)
      .then((parsedSchema) => {
        getParametersSchema = parsedSchema;
        done();
      });
  });

  let outputSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/output.schema.json`).then((parsedSchema) => {
      outputSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Thermostat (Commands [07-0d]) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "02090000fd00110700d2fd001108ffecfd001109ffd8fd00110a0046fc00100b03fd00110c00aafc00100d01",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "comfort_setpoint");
        assert.equal(value.data.comfortSetpoint, 21);

        utils.validateSchema(value.data, comfortSetpointSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "standby_offset");
        assert.equal(value.data.standbyOffset, -2);

        utils.validateSchema(value.data, standbyOffsetSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "economy_offset");
        assert.equal(value.data.economyOffset, -4);

        utils.validateSchema(value.data, economyOffsetSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "frost_prot_setpoint");
        assert.equal(value.data.frostProtSetpoint, 7);

        utils.validateSchema(value.data, frostProtSetpointSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "operation_mode");
        assert.equal(value.data.operationMode, 3);

        utils.validateSchema(value.data, operationModeSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "get_parameters");
        assert.equal(value.data.getParameters, 17);

        utils.validateSchema(value.data, getParametersSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "output");
        assert.equal(value.data.output, 1);

        utils.validateSchema(value.data, outputSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Thermostat (batteryVoltage,internalTemperature,humidity,illuminance,presenceCounter) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "020a000008000111510d000100a71000001c1a000100086000010032",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4433);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 16.7);
        assert.equal(value.data.internalTemperatureF, 62.1);

        utils.validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 28);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "illuminance");
        assert.equal(value.data.illuminance, 0.08);

        utils.validateSchema(value.data, illuminanceSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "presence_counter");
        assert.equal(value.data.presenceCounter, 50);

        utils.validateSchema(value.data, presenceCounterSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
    it("should decode the Yosensi YO Thermostat (batteryVoltage,internalTemperature,humidity,co2,illuminance,presenceCounter) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "027D000008000110800D000101061000003B6C000102F31A000101396000010012",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4224);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 26.2);
        assert.equal(value.data.internalTemperatureF, 79.2);

        utils.validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 59);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 755);

        utils.validateSchema(value.data, co2Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "illuminance");
        assert.equal(value.data.illuminance, 3.13);

        utils.validateSchema(value.data, illuminanceSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "presence_counter");
        assert.equal(value.data.presenceCounter, 18);

        utils.validateSchema(value.data, presenceCounterSchema, {
          throwError: true,
        });
      });
      consume(data);
    });
  });
});
