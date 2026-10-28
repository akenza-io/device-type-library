import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Moko LW001-BG-PRO Uplink", () => {
  let bluetoothSchema = null;
  let consume = null;
  let fixFailureSchema = null;
  let gpsSchema = null;
  let lifecycleSchema = null;
  let mandownSchema = null;
  let movementSchema = null;
  let rebootSchema = null;
  let shutdownSchema = null;
  let systemSchema = null;
  let tamperSchema = null;
  let timeSchema = null;
  let vibrationSchema = null;
  let wifiSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    bluetoothSchema = loadSchema(`${import.meta.dirname}/bluetooth.schema.json`);
    fixFailureSchema = loadSchema(`${import.meta.dirname}/fix_failure.schema.json`);
    gpsSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    mandownSchema = loadSchema(`${import.meta.dirname}/mandown.schema.json`);
    movementSchema = loadSchema(`${import.meta.dirname}/movement.schema.json`);
    rebootSchema = loadSchema(`${import.meta.dirname}/reboot.schema.json`);
    shutdownSchema = loadSchema(`${import.meta.dirname}/shutdown.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    tamperSchema = loadSchema(`${import.meta.dirname}/tamper.schema.json`);
    timeSchema = loadSchema(`${import.meta.dirname}/time.schema.json`);
    vibrationSchema = loadSchema(`${import.meta.dirname}/vibration.schema.json`);
    wifiSchema = loadSchema(`${import.meta.dirname}/wifi.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Moko LW001-BG-PRO heartbeat payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "211be0014700000000",
        },
      };

      expectSample("reboot", rebootSchema, (data) => {
        assert.equal(data.activityCount, 0);
        assert.equal(data.firmwareVersion, 'V1.0.7');
        assert.equal(data.rebootReason, "BLUETOOTH_COMMAND");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.acknowledgeByte, 0);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.lowBattery, false);
        assert.equal(data.mandown, false);
        assert.equal(data.motionSinceLastPaylaod, true);
        assert.equal(data.operationMode, "PERIODIC");
        assert.equal(data.tamperAlarm, false);
        assert.equal(data.temperature, 27);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO location fix payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex:
            "011be00207e9040b082a33000912278998443aa12912",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.acknowledgeByte, 0);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.lowBattery, false);
        assert.equal(data.mandown, false);
        assert.equal(data.motionSinceLastPaylaod, true);
        assert.equal(data.operationMode, "PERIODIC");
        assert.equal(data.positioningType, "DOWNLINK_FOR_POSITION");
        assert.equal(data.tamperAlarm, false);
        assert.equal(data.temperature, 27);
      });

      expectSample("gps", gpsSchema, (data) => {
        assert.equal(data.latitude, 30.4581016);
        assert.equal(data.longitude, 114.4693033);
        assert.equal(data.pdop, 1.8);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO location failure payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex:
            "011af00500",
        },
      };

      expectSample("fix_failure", fixFailureSchema, (data) => {
        assert.equal(data.reasonsForPositioningFailure, 'Bluetooth broadcasting in progress (Please reduce the Bluetooth broadcast timeout or avoid Bluetooth positioning when Bluetooth broadcasting in process via MKLoRa app)');
        assert.deepEqual(data.macData, []);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.acknowledgeByte, 0);
        assert.equal(data.batteryVoltage, 3.7);
        assert.equal(data.lowBattery, false);
        assert.equal(data.mandown, false);
        assert.equal(data.motionSinceLastPaylaod, true);
        assert.equal(data.operationMode, "PERIODIC");
        assert.equal(data.positioningType, "DOWNLINK_FOR_POSITION");
        assert.equal(data.tamperAlarm, false);
        assert.equal(data.temperature, 26);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO shutdown payload", () => {
      const data = {
        data: {
          port: 4,
          payloadHex:
            "211af002",
        },
      };

      expectSample("shutdown", shutdownSchema, (data) => {
        assert.equal(data.shutdownType, 'MAGNETIC');
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.acknowledgeByte, 0);
        assert.equal(data.batteryVoltage, 3.7);
        assert.equal(data.lowBattery, false);
        assert.equal(data.mandown, false);
        assert.equal(data.motionSinceLastPaylaod, true);
        assert.equal(data.operationMode, "PERIODIC");
        assert.equal(data.tamperAlarm, false);
        assert.equal(data.temperature, 26);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO vibration payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex:
            "211be00001",
        },
      };

      expectSample("vibration", vibrationSchema, (data) => {
        assert.equal(data.numberOfShocks, 1);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.acknowledgeByte, 0);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.lowBattery, false);
        assert.equal(data.mandown, false);
        assert.equal(data.motionSinceLastPaylaod, true);
        assert.equal(data.operationMode, "PERIODIC");
        assert.equal(data.tamperAlarm, false);
        assert.equal(data.temperature, 27);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO Man down payload", () => {
      const data = {
        data: {
          port: 6,
          payloadHex:
            "1117e10040",
        },
      };

      expectSample("mandown", mandownSchema, (data) => {
        assert.equal(data.totalIdleTime, 64);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.acknowledgeByte, 1);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.lowBattery, false);
        assert.equal(data.mandown, true);
        assert.equal(data.motionSinceLastPaylaod, true);
        assert.equal(data.operationMode, "PERIODIC");
        assert.equal(data.tamperAlarm, false);
        assert.equal(data.temperature, 23);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO tamper payload", () => {
      const data = {
        data: {
          port: 7,
          payloadHex:
            "0b1be007e9040b09073300",
        },
      };

      expectSample("tamper", tamperSchema, (data) => {
        assert.equal(data.tamperAlarm, true);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.acknowledgeByte, 0);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.lowBattery, false);
        assert.equal(data.mandown, false);
        assert.equal(data.motionSinceLastPaylaod, true);
        assert.equal(data.operationMode, "MOTION");
        assert.equal(data.tamperAlarm, true);
        assert.equal(data.temperature, 27);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO event payload", () => {
      const data = {
        data: {
          port: 8,
          payloadHex:
            "231be000",
        },
      };

      expectSample("movement", movementSchema, (data) => {
        assert.equal(data.eventType, "START_OF_MOVEMENT");
        assert.equal(data.movementDetected, true);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.acknowledgeByte, 0);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.lowBattery, false);
        assert.equal(data.mandown, false);
        assert.equal(data.motionSinceLastPaylaod, true);
        assert.equal(data.operationMode, "MOTION");
        assert.equal(data.tamperAlarm, false);
        assert.equal(data.temperature, 27);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO Battery consumption payload", () => {
      const data = {
        data: {
          port: 9,
          payloadHex:
            "011ae1000220a60000000000000000000afee500000148",
        },
      };

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.bleAdvWorkTime, 720613);
        assert.equal(data.bleScanWorkTime, 0);
        assert.equal(data.gpsWorkTime, 139430);
        assert.equal(data.loraWorkTime, 328);
        assert.equal(data.wifiWorkTime, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.acknowledgeByte, 1);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.lowBattery, false);
        assert.equal(data.mandown, false);
        assert.equal(data.motionSinceLastPaylaod, true);
        assert.equal(data.operationMode, "PERIODIC");
        assert.equal(data.tamperAlarm, false);
        assert.equal(data.temperature, 26);
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO Extrem GPS payload", () => {
      const data = {
        data: {
          port: 12,
          payloadHex:
            "01e112278c97443aa3d411",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.lorawanDownlinkCount, 1);
        assert.equal(data.lowBattery, false);
        assert.equal(data.mandown, false);
        assert.equal(data.motionSinceLastPaylaod, false);
        assert.equal(data.operationMode, "PERIODIC");
        assert.equal(data.tamperAlarm, false);
      });

      expectSample("gps", gpsSchema, (data) => {
        assert.equal(data.latitude, 30.4581783);
        assert.equal(data.longitude, 114.4693716);
        assert.equal(data.pdop, 1.7);
      });

      consume(data);
    });
  });
});
