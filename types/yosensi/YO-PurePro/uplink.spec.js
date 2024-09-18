const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Pure Pro uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
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

  let pressureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/pressure.schema.json`)
      .then((parsedSchema) => {
        pressureSchema = parsedSchema;
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

  let tvocSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/tvoc.schema.json`).then((parsedSchema) => {
      tvocSchema = parsedSchema;
      done();
    });
  });

  let coSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/co.schema.json`).then((parsedSchema) => {
      coSchema = parsedSchema;
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

  let soundSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/sound.schema.json`).then((parsedSchema) => {
      soundSchema = parsedSchema;
      done();
    });
  });

  let pm2_5Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/pm2_5.schema.json`).then((parsedSchema) => {
      pm2_5Schema = parsedSchema;
      done();
    });
  });

  let pm4Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/pm4.schema.json`).then((parsedSchema) => {
      pm4Schema = parsedSchema;
      done();
    });
  });

  let pm10Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/pm10.schema.json`).then((parsedSchema) => {
      pm10Schema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Pure Pro (temperature,humidity,pressure,illuminance,tvoc,co,co2,sound) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "02f602460d000101081000001a15000127221a000100012200030000007d69000100116c000102797000010032",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 26.4);

        utils.validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 26);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pressure");
        assert.equal(value.data.pressure, 1001.8);

        utils.validateSchema(value.data, pressureSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "illuminance");
        assert.equal(value.data.illuminance, 0.01);

        utils.validateSchema(value.data, illuminanceSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "tvoc");
        assert.equal(value.data.tvoc, 1.25);

        utils.validateSchema(value.data, tvocSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co");
        assert.equal(value.data.co, 1.7);

        utils.validateSchema(value.data, coSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 633);

        utils.validateSchema(value.data, co2Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "sound");
        assert.equal(value.data.sound, 50);

        utils.validateSchema(value.data, soundSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Pure Pro (PM2.5, PM4, PM10) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "02f7028325001102001d25001103001d25001104001d",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pm2_5");
        assert.equal(value.data.pm2_5, 2.9);

        utils.validateSchema(value.data, pm2_5Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pm4");
        assert.equal(value.data.pm4, 2.9);

        utils.validateSchema(value.data, pm4Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pm10");
        assert.equal(value.data.pm10, 2.9);

        utils.validateSchema(value.data, pm10Schema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Pure Pro (PM10) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "020402f825001104001b",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pm10");
        assert.equal(value.data.pm10, 2.7);

        utils.validateSchema(value.data, pm10Schema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Pure Pro (Illuminance, CO) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "02fc03011a0001000b697501005a",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "illuminance");
        assert.equal(value.data.illuminance, 0.11);

        utils.validateSchema(value.data, illuminanceSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co");
        assert.equal(value.data.co, 9);

        utils.validateSchema(value.data, coSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
