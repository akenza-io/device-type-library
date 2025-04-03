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

  let manDownSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/mandown.schema.json`)
      .then((parsedSchema) => {
        manDownSchema = parsedSchema;
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
    it("should decode the LW001-BG-PRO heartbeat payload", () => {
      const data = {
        data: {
          port: 12,
          payloadHex:
            "020156F80B45F4293246",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.lorawanDownlinkCount, 1);
        assert.equal(value.data.batteryVoltage, 2.2);
        assert.equal(value.data.lowBattery, true);
        assert.equal(value.data.mandown, true);
        assert.equal(value.data.motionSinceLastPaylaod, true);
        assert.equal(value.data.operationMode, "TIMING");
        assert.equal(value.data.tamperAlarm, true);
        assert.equal(value.data.positioningType, "DOWNLINK_FOR_POSITION");

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.latitude, 145.9096389);
        assert.equal(value.data.longitude, -19.8626746);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
