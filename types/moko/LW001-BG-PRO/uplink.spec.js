const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Moko LW001-BG-PRO Uplink", () => {
  let bluetoothSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/bluetooth.schema.json`).then((parsedSchema) => {
      bluetoothSchema = parsedSchema;
      done();
    });
  });

  let fixFailureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/fix_failure.schema.json`)
      .then((parsedSchema) => {
        fixFailureSchema = parsedSchema;
        done();
      });
  });

  let gpsSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/gps.schema.json`)
      .then((parsedSchema) => {
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

  let mandownSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/mandown.schema.json`)
      .then((parsedSchema) => {
        mandownSchema = parsedSchema;
        done();
      });
  });

  let movementSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/movement.schema.json`)
      .then((parsedSchema) => {
        movementSchema = parsedSchema;
        done();
      });
  });

  let rebootSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/reboot.schema.json`)
      .then((parsedSchema) => {
        rebootSchema = parsedSchema;
        done();
      });
  });

  let shutdownSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/shutdown.schema.json`)
      .then((parsedSchema) => {
        shutdownSchema = parsedSchema;
        done();
      });
  });

  let systemSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/system.schema.json`)
      .then((parsedSchema) => {
        systemSchema = parsedSchema;
        done();
      });
  });

  let tamperSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/tamper.schema.json`)
      .then((parsedSchema) => {
        tamperSchema = parsedSchema;
        done();
      });
  });

  let timeSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/time.schema.json`)
      .then((parsedSchema) => {
        timeSchema = parsedSchema;
        done();
      });
  });

  let vibrationSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/vibration.schema.json`)
      .then((parsedSchema) => {
        vibrationSchema = parsedSchema;
        done();
      });
  });

  let wifiSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/wifi.schema.json`)
      .then((parsedSchema) => {
        wifiSchema = parsedSchema;
        done();
      });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.acknowledgeByte, 0);
        assert.equal(value.data.batteryVoltage, 3.6);
        assert.equal(value.data.lowBattery, true);
        assert.equal(value.data.mandown, true);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "PERIODIC");
        assert.equal(value.data.tamperAlarm, true);
        assert.equal(value.data.temperature, 27);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // ???
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reboot");
        assert.equal(value.data.activityCount, 18176);
        assert.equal(value.data.firmwareVersion, 'V1.0.7');
        assert.equal(value.data.rebootReason, undefined);

        utils.validateSchema(value.data, rebootSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
