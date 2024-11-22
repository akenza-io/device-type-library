const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("CT101 Uplink", () => {
  let defaultSchema = null;
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

  let systemSchema = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/system.schema.json`).then((parsedSchema) => {
      systemSchema = parsedSchema;
      done();
    });
  });

  let alarmSchema = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/alarm.schema.json`).then((parsedSchema) => {
      alarmSchema = parsedSchema;
      done();
    });
  });

  let totalCurrentSchema = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/totalCurrent.schema.json`)
      .then((parsedSchema) => {
        totalCurrentSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the CT101 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FF0BFFFF0101FF166746D38802580000FF090100FF0A0101FF0F00",
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

        utils.validateSchema(value.data, systemSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the CT101 payload", () => {
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

        assert.equal(value.topic, "totalCurrent");
        assert.equal(value.data.totalCurrent, 100);

        utils.validateSchema(value.data, totalCurrentSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode should decode the CT101 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "8498B80BD007C40905",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.current, 25);
        assert.equal(value.data.currentMin, 20);
        assert.equal(value.data.currentMax, 30);

        utils.validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.overRangeAlarm, true);
        assert.equal(value.data.overRangeAlarmRelease, false);
        assert.equal(value.data.thresholdAlarm, true);
        assert.equal(value.data.thresholdAlarmRelease, false);

        utils.validateSchema(value.data, alarmSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
