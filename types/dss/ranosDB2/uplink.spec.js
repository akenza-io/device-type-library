const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("DSS Ranos dB 2 Uplink", () => {
  let defaultSchema = null;
  let gpsSchema = null;
  let lifecycleSchema = null;
  let settingsSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    utils.loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
      done();
    });
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/settings.schema.json`)
      .then((parsedSchema) => {
        settingsSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the DSS Ranos dB 2 payload", () => {
      const data = {
        data: {
          payloadHex: "7bff3c5ed3421c3e57160592ae0580408c140041406812104120",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.dBAfast, 32.2);
        assert.equal(value.data.dBAslow, 30.4);
        assert.equal(value.data.dBCfast, 33.5);
        assert.equal(value.data.dBCslow, 32);
        assert.equal(value.data.leqA, 30.1);
        assert.equal(value.data.leqC, 32);
        assert.equal(value.data.positivePeakHoldA, 32.6);
        assert.equal(value.data.positivePeakHoldC, 36.5);
        assert.equal(value.data.negativePeakHoldA, 31.8);
        assert.equal(value.data.negativePeakHoldC, 31.8);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 6);
        assert.equal(value.data.batteryLevel, 70);
        // assert.equal(value.data.transmitInterval, 2518);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.latitude, 47.4141534);
        assert.equal(value.data.longitude, 8.5350206);

        utils.validateSchema(value.data, gpsSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the DSS Ranos dB 2 settings payload", () => {
      const data = {
        data: {
          payloadHex: "800009F701002E93020260EA0000BFFF80",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "settings");
        assert.equal(value.data.adr, false);
        assert.equal(value.data.correction, -0.9);
        assert.equal(value.data.enableHeadphone, false);
        assert.equal(value.data.enableLed, true);
        assert.equal(value.data.enableTransmissionSync, true);
        assert.equal(value.data.gpsInterval, 43200000);
        assert.equal(value.data.gpsMode, "ONCE");
        assert.equal(value.data.sampleCount, 2);
        assert.equal(value.data.spreadingFactor, 9);
        assert.equal(value.data.transmitInterval, 60000);
        assert.equal(value.data.useBat, true);
        assert.equal(value.data.useFirstTimestamp, true);
        assert.equal(value.data.useLAeq, true);
        assert.equal(value.data.useLAf, true);
        assert.equal(value.data.useLAmax, true);
        assert.equal(value.data.useLAmin, true);
        assert.equal(value.data.useLAs, true);
        assert.equal(value.data.useLastTimestamp, true);
        assert.equal(value.data.useLCeq, true);
        assert.equal(value.data.useLCf, true);
        assert.equal(value.data.useLCmax, true);
        assert.equal(value.data.useLCmin, true);
        assert.equal(value.data.useLCs, true);
        assert.equal(value.data.useMsgInfo, true);

        utils.validateSchema(value.data, settingsSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
