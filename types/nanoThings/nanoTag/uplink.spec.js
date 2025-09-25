const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("NanoThings uplink", () => {
  let configurationAckSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/configuration_ack.schema.json`)
      .then((parsedSchema) => {
        configurationAckSchema = parsedSchema;
        done();
      });
  });

  let deviceStatusSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/device_status.schema.json`)
      .then((parsedSchema) => {
        deviceStatusSchema = parsedSchema;
        done();
      });
  });

  let firstTimestampSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/first_timestamp.schema.json`)
      .then((parsedSchema) => {
        firstTimestampSchema = parsedSchema;
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

  let reportFrameSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/report_frame.schema.json`)
      .then((parsedSchema) => {
        reportFrameSchema = parsedSchema;
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

  describe("consume()", () => {
    it("should decode the nanoTag lifecycle payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "474B0CB2",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.batteryVoltage, 3.25);
        assert.equal(value.data.internalTemperature, 25);
        assert.equal(value.data.internalTemperatureF, 77);

        utils.validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 21);
        assert.equal(value.data.temperatureF, 69.8);

        utils.validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the nanoTag configuration acknowledgement payload", () => {
      const data = {
        data: {
          port: 25,
          payloadHex: "01000f003c00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "configuration_ack");
        assert.equal(value.data.ackId, 1);
        assert.equal(value.data.recordPeriod, 15);
        assert.equal(value.data.reportPeriod, 60);
        assert.equal(value.data.unit, "MINUTES");

        utils.validateSchema(value.data, configurationAckSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the nanoTag report frame payload", () => {
      const data = {
        data: {
          port: 26,
          payloadHex: "00011c721c601c521c47",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "report_frame");
        assert.equal(value.data.fid, 1);
        assert.equal(value.data.temperature1, 22.8);
        assert.equal(value.data.temperature1F, 73);
        assert.equal(value.data.temperature2, 22.6);
        assert.equal(value.data.temperature2F, 72.7);
        assert.equal(value.data.temperature3, 22.5);
        assert.equal(value.data.temperature3F, 72.5);
        assert.equal(value.data.temperature4, 22.4);
        assert.equal(value.data.temperature4F, 72.3);

        utils.validateSchema(value.data, reportFrameSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the nanoTag report frame payload", () => {
      const data = {
        data: {
          port: 21,
          payloadHex: "0CC0000000A862C4753A",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.batteryVoltage, 3.264);

        utils.validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "device_status");
        assert.equal(value.data.lastSampleNumber, 168);
        /*
        console.log(
          `Whats the type of lastSampleTimestamp: ${typeof value.data
            .lastSampleTimestamp}`,
        );
        assert.typeOf(value.data.lastSampleTimestamp, "object");
        */
        utils.validateSchema(value.data, deviceStatusSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
