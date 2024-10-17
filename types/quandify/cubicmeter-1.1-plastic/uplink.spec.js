const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Quandify CubicMeter 1.1 Plastic Uplink", () => {
  let consume = null;

  let defaultSchema = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  let responseSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/response.schema.json`).then((parsedSchema) => {
      responseSchema = parsedSchema;
      done();
    });
  });

  let systemSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/system.schema.json`).then((parsedSchema) => {
      systemSchema = parsedSchema;
      done();
    });
  });

  let settingsSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/settings.schema.json`).then((parsedSchema) => {
      settingsSchema = parsedSchema;
      done();
    });
  });

  let errorSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/error.schema.json`).then((parsedSchema) => {
      errorSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the status report on port 1", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "49FBDF010000DE1400000000000046EDDF0106FC8B0702E2E6535455",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.deepStrictEqual(value.data, {
          totalVolume: 5342,
          leakIsOngoing: false,
          leakState: 2,
          leakStatus: "NO_LEAK",
          waterTemperatureMin: 21.5,
          waterTemperatureMax: 22,
          ambientTemperature: 22.5,
        });

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.deepStrictEqual(value.data, {
          isSensing: true,
          batteryVoltage: 3.640,
          batteryStatus: "OK",
        });

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });

  it("should decode the status report and report low battery on port 1", () => {
    const data = {
      data: {
        port: 1,
        payloadHex: "49FBDF010000DE1400000000000046EDDF0106FC8B07020102535455",
      },
    };

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "default");
      assert.deepStrictEqual(value.data, {
        totalVolume: 5342,
        leakIsOngoing: false,
        leakState: 2,
        leakStatus: "NO_LEAK",
        waterTemperatureMin: 21.5,
        waterTemperatureMax: 22,
        ambientTemperature: 22.5,
      });
    });

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "lifecycle");
      assert.deepStrictEqual(value.data, {
        isSensing: true,
        batteryVoltage: 1.816,
        batteryStatus: "LOW"
      });
    });

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "error");
      assert.deepStrictEqual(value.data, {
        level: "warning",
        message: "Low battery",
      });
    });

    consume(data);
  });

  it("should decode the status report and report contact support on port 1", () => {
    const data = {
      data: {
        port: 1,
        payloadHex: "49FBDF01E703DE1400000000000046EDDF0106FC8B0702E2E6535455",
      },
    };

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "default");
      assert.deepStrictEqual(value.data, {
        totalVolume: 5342,
        leakIsOngoing: false,
        leakState: 2,
        leakStatus: "NO_LEAK",
        waterTemperatureMin: 21.5,
        waterTemperatureMax: 22,
        ambientTemperature: 22.5,
      });
    });

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "lifecycle");
      assert.deepStrictEqual(value.data, {
        isSensing: true,
        batteryVoltage: 3.640,
        batteryStatus: "OK"
      });
    });

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "error");
      assert.deepStrictEqual(value.data, {
        level: "warning",
        message: "Contact Quandify support, error 999",
      });

      utils.validateSchema(value.data, errorSchema, { throwError: true });
    });

    consume(data);
  });


  it("should decode the response to get status report as a status report on port 6", () => {
    const data = {
      data: {
        port: 6,
        payloadHex: "3700019F42D701000077830000F3000000000000000000000000E1E43E3E3A",
      },
    };

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "response");
      assert.deepStrictEqual(value.data, {
        fPort: 55,
        status: "OK",
        type: "STATUS_REPORT"
      });

      utils.validateSchema(value.data, responseSchema, { throwError: true });
    });

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "default");
      assert.deepStrictEqual(value.data, {
        totalVolume: 33655,
        leakIsOngoing: false,
        leakState: 0,
        leakStatus: "NO_LEAK",
        waterTemperatureMin: 11,
        waterTemperatureMax: 11,
        ambientTemperature: 9,
      });

      utils.validateSchema(value.data, defaultSchema, { throwError: true });
    });

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "lifecycle");
      assert.deepStrictEqual(value.data, {
        isSensing: true,
        batteryVoltage: 3.624,
        batteryStatus: "OK",
      });

      utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
    });

    consume(data);
  });

  it("should decode the response to get hardware report as a hardware report on port 6", () => {
    const data = {
      data: {
        port: 6,
        payloadHex: "3200021300001602053F0000000000ED5A413DFC449C2B000001000000000001010000000000",
      },
    };

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "response");
      assert.deepStrictEqual(value.data, {
        fPort: 50,
        status: "OK",
        type: "HARDWARE_REPORT"
      });

      utils.validateSchema(value.data, responseSchema, { throwError: true });
    });

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "system");
      assert.deepStrictEqual(value.data, {
        firmwareVersion: "22.0.19",
        hardwareVersion: 2,
        appState: "METERING",
        pipeId: 1,
        pipeType: "Copper 15 mm",
      });

      utils.validateSchema(value.data, systemSchema, { throwError: true });
    });

    consume(data);
  });

  it("should decode the response to set pipe index as a hardware report on port 6", () => {
    const data = {
      data: {
        port: 6,
        payloadHex: "0400021000001602053f0100000300e3ddcbb1bd758732000001000000000000010000000000",
      },
    };

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "response");
      assert.deepStrictEqual(value.data, {
        fPort: 4,
        status: "OK",
        type: "HARDWARE_REPORT"
      });

      utils.validateSchema(value.data, responseSchema, { throwError: true });
    });

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "system");
      assert.deepStrictEqual(value.data, {
        firmwareVersion: "22.0.16",
        hardwareVersion: 2,
        appState: "METERING",
        pipeId: 0,
        pipeType: "Custom",
      });

      utils.validateSchema(value.data, systemSchema, { throwError: true });
    });

    consume(data);
  });

  it("should decode the response to set lorawan report interval as a settings report on port 6", () => {
    const data = {
      data: {
        port: 6,
        payloadHex: "13000401C0A80000580200000000001E00008D27000000000000000000000000000000000000000000",
      },
    };

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "response");
      assert.deepStrictEqual(value.data, {
        fPort: 19,
        status: "OK",
        type: "SETTINGS_REPORT"
      });

      utils.validateSchema(value.data, responseSchema, { throwError: true });
    });

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "settings");
      assert.deepStrictEqual(value.data, {
        lorawanReportInterval: 600,
      });

      utils.validateSchema(value.data, settingsSchema, { throwError: true });
    });

    consume(data);
  });
});
