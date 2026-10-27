
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Quandify CubicMeter 1.1 Plastic Uplink", () => {
  let consume = null;
  let defaultSchema = null;
  let lifecycleSchema = null;
  let responseSchema = null;
  let systemSchema = null;
  let settingsSchema = null;
  let errorSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    responseSchema = loadSchema(`${import.meta.dirname}/response.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    settingsSchema = loadSchema(`${import.meta.dirname}/settings.schema.json`);
    errorSchema = loadSchema(`${import.meta.dirname}/error.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the status report on port 1", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "49FBDF010000DE1400000000000046EDDF0106FC8B0702E2E6535455",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.deepStrictEqual(data, {
          totalVolume: 5342,
          leakIsOngoing: false,
          leakState: 2,
          leakStatus: "NO_LEAK",
          waterTemperatureMin: 21.5,
          waterTemperatureMax: 22,
          ambientTemperature: 22.5,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepStrictEqual(data, {
          isSensing: true,
          batteryVoltage: 3.640,
          batteryStatus: "OK",
        });
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

    expectEmits((type, value) => {
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

    expectEmits((type, value) => {
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

    expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "error");
      assert.deepStrictEqual(value.data, {
        level: "WARNING",
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

    expectEmits((type, value) => {
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

    expectEmits((type, value) => {
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

    expectSample("error", errorSchema, (data) => {
      assert.deepStrictEqual(data, {
        level: "WARNING",
        message: "Contact Quandify support, error 999",
      });
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

    expectSample("response", responseSchema, (data) => {
      assert.deepStrictEqual(data, {
        fPort: 55,
        status: "OK",
        type: "STATUS_REPORT"
      });
    });

    expectSample("default", defaultSchema, (data) => {
      assert.deepStrictEqual(data, {
        totalVolume: 33655,
        leakIsOngoing: false,
        leakState: 0,
        leakStatus: "NO_LEAK",
        waterTemperatureMin: 11,
        waterTemperatureMax: 11,
        ambientTemperature: 9,
      });
    });

    expectSample("lifecycle", lifecycleSchema, (data) => {
      assert.deepStrictEqual(data, {
        isSensing: true,
        batteryVoltage: 3.624,
        batteryStatus: "OK",
      });
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

    expectSample("response", responseSchema, (data) => {
      assert.deepStrictEqual(data, {
        fPort: 50,
        status: "OK",
        type: "HARDWARE_REPORT"
      });
    });

    expectSample("system", systemSchema, (data) => {
      assert.deepStrictEqual(data, {
        firmwareVersion: "22.0.19",
        hardwareVersion: 2,
        appState: "METERING",
        pipeId: 1,
        pipeType: "Copper 15 mm",
      });
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

    expectSample("response", responseSchema, (data) => {
      assert.deepStrictEqual(data, {
        fPort: 4,
        status: "OK",
        type: "HARDWARE_REPORT"
      });
    });

    expectSample("system", systemSchema, (data) => {
      assert.deepStrictEqual(data, {
        firmwareVersion: "22.0.16",
        hardwareVersion: 2,
        appState: "METERING",
        pipeId: 0,
        pipeType: "Custom",
      });
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

    expectSample("response", responseSchema, (data) => {
      assert.deepStrictEqual(data, {
        fPort: 19,
        status: "OK",
        type: "SETTINGS_REPORT"
      });
    });

    expectSample("settings", settingsSchema, (data) => {
      assert.deepStrictEqual(data, {
        lorawanReportInterval: 600,
      });
    });

    consume(data);
  });
});
