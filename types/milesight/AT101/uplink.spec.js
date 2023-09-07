const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("AT101 Uplink", () => {
  let gpsSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
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

  let temperatureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
        temperatureSchema = parsedSchema;
        done();
      });
  });

  let wifiSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/wifi.schema.json`).then((parsedSchema) => {
      wifiSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode should decode the GPS AT101 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403671B01050000048836BF7701F000090722",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.temperature, 28.3);

        utils.validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.geofenceStatus, "UNSET");
        assert.equal(value.data.latitude, 24.62495);
        assert.equal(value.data.longitude, 118.030576);
        assert.equal(value.data.motionStatus, "MOVING");

        utils.validateSchema(value.data, gpsSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.position, "NORMAL");

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the WIFI AT101 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "01756403671B0105000106D9081CC316222DF9C30206D90824E124F6A667B60206D90824E124F54DE3BC0206D90824E124F57971B20206D90824E124F319A8C802",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.temperature, 28.3);

        utils.validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.position, "TILT");

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.typeOf(value.data.wifi, "array");

        utils.validateSchema(value.data, wifiSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
