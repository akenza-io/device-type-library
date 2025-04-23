const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("CT305 Uplink", () => {
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

  let systemSchema = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/system.schema.json`).then((parsedSchema) => {
      systemSchema = parsedSchema;
      done();
    });
  });

  let channel1Schema = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/channel1.schema.json`).then((parsedSchema) => {
      channel1Schema = parsedSchema;
      done();
    });
  });

  let channel2Schema = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/channel2.schema.json`)
      .then((parsedSchema) => {
        channel2Schema = parsedSchema;
        done();
      });
  });

  let channel3Schema = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/channel3.schema.json`)
      .then((parsedSchema) => {
        channel3Schema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the CT305 system payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FF0BFFFF0101FF166746D38802580000FF090100FF0A0101FF0F00FFFF0101",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.firmwareVersion, "1.1");
        assert.equal(value.data.hardwareVersion, "1.0");
        assert.equal(value.data.ipsoVersion, "0.1");
        assert.equal(value.data.powerOn, true);
        assert.equal(value.data.sn, "6746d38802580000");
        assert.equal(value.data.tslVersion, "1.1");

        utils.validateSchema(value.data, systemSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the CT305 totalCurrent payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "039710270000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "channel1");
        assert.equal(value.data.totalCurrent, 100);

        utils.validateSchema(value.data, channel1Schema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode should decode the CT305 alarm payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "8499B80BD007C40905",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "channel1");
        assert.deepEqual(value.data.alarm, ["THRESHOLD_ALARM", "OVER_RANGE_ALARM"]);
        assert.equal(value.data.current, 250);
        assert.equal(value.data.currentMax, 300);
        assert.equal(value.data.currentMin, 200);

        utils.validateSchema(value.data, channel1Schema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
