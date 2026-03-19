import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Moko LW001-BG-PRO Uplink", () => {
  let bluetoothSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/bluetooth.schema.json`).then((parsedSchema) => {
      bluetoothSchema = parsedSchema;
      done();
    });
  });

  let fixFailureSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/fix_failure.schema.json`).then((parsedSchema) => {
      fixFailureSchema = parsedSchema;
      done();
    });
  });

  let gpsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  let mandownSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/mandown.schema.json`).then((parsedSchema) => {
      mandownSchema = parsedSchema;
      done();
    });
  });

  let movementSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/movement.schema.json`).then((parsedSchema) => {
      movementSchema = parsedSchema;
      done();
    });
  });

  let rebootSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/reboot.schema.json`).then((parsedSchema) => {
      rebootSchema = parsedSchema;
      done();
    });
  });

  let shutdownSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/shutdown.schema.json`).then((parsedSchema) => {
      shutdownSchema = parsedSchema;
      done();
    });
  });

  let systemSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/system.schema.json`).then((parsedSchema) => {
      systemSchema = parsedSchema;
      done();
    });
  });

  let tamperSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/tamper.schema.json`).then((parsedSchema) => {
      tamperSchema = parsedSchema;
      done();
    });
  });

  let timeSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/time.schema.json`).then((parsedSchema) => {
      timeSchema = parsedSchema;
      done();
    });
  });

  let vibrationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/vibration.schema.json`).then((parsedSchema) => {
      vibrationSchema = parsedSchema;
      done();
    });
  });

  let wifiSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/wifi.schema.json`).then((parsedSchema) => {
      wifiSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Moko LW001-BG-PRO heartbeat payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "211be0014700000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reboot");
        assert.equal(value.data.activityCount, 0);
        assert.equal(value.data.firmwareVersion, "V1.0.7");
        assert.equal(value.data.rebootReason, "BLUETOOTH_COMMAND");

        validateSchema(value.data, rebootSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acknowledgeByte, 0);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.mandown, false);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "PERIODIC");
        assert.equal(value.data.tamperAlarm, false);
        assert.equal(value.data.temperature, 27);
        assert.equal(value.data.temperatureF, 80.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO location fix payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "011be00207e9040b082a33000912278998443aa12912",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acknowledgeByte, 0);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.mandown, false);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "PERIODIC");
        assert.equal(value.data.positioningType, "DOWNLINK_FOR_POSITION");
        assert.equal(value.data.tamperAlarm, false);
        assert.equal(value.data.temperature, 27);
        assert.equal(value.data.temperatureF, 80.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.latitude, 30.4581016);
        assert.equal(value.data.longitude, 114.4693033);
        assert.equal(value.data.pdop, 1.8);

        validateSchema(value.data, gpsSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO location failure payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "011af00500",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "fix_failure");
        assert.equal(
          value.data.reasonsForPositioningFailure,
          "Bluetooth broadcasting in progress (Please reduce the Bluetooth broadcast timeout or avoid Bluetooth positioning when Bluetooth broadcasting in process via MKLoRa app)",
        );
        assert.deepEqual(value.data.macData, []);

        validateSchema(value.data, fixFailureSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acknowledgeByte, 0);
        assert.equal(value.data.batteryVoltage, 3.7);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.mandown, false);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "PERIODIC");
        assert.equal(value.data.positioningType, "DOWNLINK_FOR_POSITION");
        assert.equal(value.data.tamperAlarm, false);
        assert.equal(value.data.temperature, 26);
        assert.equal(value.data.temperatureF, 78.8);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO shutdown payload", () => {
      const data = {
        data: {
          port: 4,
          payloadHex: "211af002",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "shutdown");
        assert.equal(value.data.shutdownType, "MAGNETIC");

        validateSchema(value.data, shutdownSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acknowledgeByte, 0);
        assert.equal(value.data.batteryVoltage, 3.7);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.mandown, false);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "PERIODIC");
        assert.equal(value.data.tamperAlarm, false);
        assert.equal(value.data.temperature, 26);
        assert.equal(value.data.temperatureF, 78.8);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO vibration payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "211be00001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "vibration");
        assert.equal(value.data.numberOfShocks, 1);

        validateSchema(value.data, vibrationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acknowledgeByte, 0);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.mandown, false);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "PERIODIC");
        assert.equal(value.data.tamperAlarm, false);
        assert.equal(value.data.temperature, 27);
        assert.equal(value.data.temperatureF, 80.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO Man down payload", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "1117e10040",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "mandown");
        assert.equal(value.data.totalIdleTime, 64);

        validateSchema(value.data, mandownSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acknowledgeByte, 1);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.mandown, true);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "PERIODIC");
        assert.equal(value.data.tamperAlarm, false);
        assert.equal(value.data.temperature, 23);
        assert.equal(value.data.temperatureF, 73.4);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO tamper payload", () => {
      const data = {
        data: {
          port: 7,
          payloadHex: "0b1be007e9040b09073300",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "tamper");
        assert.equal(value.data.tamperAlarm, true);

        validateSchema(value.data, tamperSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acknowledgeByte, 0);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.mandown, false);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "MOTION");
        assert.equal(value.data.tamperAlarm, true);
        assert.equal(value.data.temperature, 27);
        assert.equal(value.data.temperatureF, 80.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO event payload", () => {
      const data = {
        data: {
          port: 8,
          payloadHex: "231be000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "movement");
        assert.equal(value.data.eventType, "START_OF_MOVEMENT");
        assert.equal(value.data.movementDetected, true);

        validateSchema(value.data, movementSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acknowledgeByte, 0);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.mandown, false);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "MOTION");
        assert.equal(value.data.tamperAlarm, false);
        assert.equal(value.data.temperature, 27);
        assert.equal(value.data.temperatureF, 80.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO Battery consumption payload", () => {
      const data = {
        data: {
          port: 9,
          payloadHex: "011ae1000220a60000000000000000000afee500000148",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.bleAdvWorkTime, 720613);
        assert.equal(value.data.bleScanWorkTime, 0);
        assert.equal(value.data.gpsWorkTime, 139430);
        assert.equal(value.data.loraWorkTime, 328);
        assert.equal(value.data.wifiWorkTime, 0);

        validateSchema(value.data, systemSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acknowledgeByte, 1);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.mandown, false);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "PERIODIC");
        assert.equal(value.data.tamperAlarm, false);
        assert.equal(value.data.temperature, 26);
        assert.equal(value.data.temperatureF, 78.8);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO Extrem GPS payload", () => {
      const data = {
        data: {
          port: 12,
          payloadHex: "01e112278c97443aa3d411",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lorawanDownlinkCount, 1);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.mandown, false);
        assert.equal(value.data.motionSinceLastPaylaod, false);
        assert.equal(value.data.operationMode, "PERIODIC");
        assert.equal(value.data.tamperAlarm, false);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.latitude, 30.4581783);
        assert.equal(value.data.longitude, 114.4693716);
        assert.equal(value.data.pdop, 1.7);

        validateSchema(value.data, gpsSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
