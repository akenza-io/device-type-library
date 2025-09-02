const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Moko LW005-MP Uplink", () => {
  let countdownSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/countdown.schema.json`).then((parsedSchema) => {
      countdownSchema = parsedSchema;
      done();
    });
  });


  let electricalSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/electrical.schema.json`)
      .then((parsedSchema) => {
        electricalSchema = parsedSchema;
        done();
      });
  });

  let energySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/energy.schema.json`)
      .then((parsedSchema) => {
        energySchema = parsedSchema;
        done();
      });
  });

  let loadStateSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/load_state.schema.json`)
      .then((parsedSchema) => {
        loadStateSchema = parsedSchema;
        done();
      });
  });

  let overcurrentSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/overcurrent.schema.json`)
      .then((parsedSchema) => {
        overcurrentSchema = parsedSchema;
        done();
      });
  });

  let overloadSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/overload.schema.json`)
      .then((parsedSchema) => {
        overloadSchema = parsedSchema;
        done();
      });
  });

  let overvoltageSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/overvoltage.schema.json`)
      .then((parsedSchema) => {
        overvoltageSchema = parsedSchema;
        done();
      });
  });

  let powerSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/power.schema.json`)
      .then((parsedSchema) => {
        powerSchema = parsedSchema;
        done();
      });
  });

  let switchSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/switch.schema.json`)
      .then((parsedSchema) => {
        switchSchema = parsedSchema;
        done();
      });
  });

  let undervoltageSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/undervoltage.schema.json`)
      .then((parsedSchema) => {
        undervoltageSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Moko LW005-MP switch payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex:
            "68a7ec46100000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "switch");
        assert.equal(value.data.acOutputState, "OFF");
        assert.equal(value.data.plugLoadStatus, "NO_LOAD");

        utils.validateSchema(value.data, switchSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO electrical payload", () => {
      const data = {
        data: {
          port: 6,
          payloadHex:
            "68a7ecfa1008b70000c32d",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "electrical");
        assert.equal(value.data.current, 0);
        assert.equal(value.data.voltage, 223.1);
        assert.equal(value.data.frequency, 49.965);

        utils.validateSchema(value.data, electricalSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO power payload", () => {
      const data = {
        data: {
          port: 7,
          payloadHex:
            "68a7fe3e100000000064",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "power");
        assert.equal(value.data.activePower, 0);
        assert.equal(value.data.powerFactor, 100);

        utils.validateSchema(value.data, powerSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO energy payload", () => {
      const data = {
        data: {
          port: 8,
          payloadHex:
            "68a81dd6100000020a0000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "energy");
        assert.equal(value.data.energyLastHour, 0);
        assert.equal(value.data.totalEnergy, 0.163125);

        utils.validateSchema(value.data, energySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO overvoltage payload", () => {
      const data = {
        data: {
          port: 9,
          payloadHex:
            "68a81dd610010ce40898",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "overvoltage");
        assert.equal(value.data.overvoltage, true);
        assert.equal(value.data.overvoltageThreshold, 220);
        assert.equal(value.data.voltage, 330);

        utils.validateSchema(value.data, overvoltageSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO undervoltage payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex:
            "68a81dd6100108340898",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "undervoltage");
        assert.equal(value.data.undervoltage, true);
        assert.equal(value.data.undervoltageThreshold, 220);
        assert.equal(value.data.voltage, 210);

        utils.validateSchema(value.data, undervoltageSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO overcurrent payload", () => {
      const data = {
        data: {
          port: 11,
          payloadHex:
            "68a81dd6100103e803e6",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "overcurrent");
        assert.equal(value.data.overcurrent, true);
        assert.equal(value.data.overcurrentThreshold, 0.998);
        assert.equal(value.data.current, 1);

        utils.validateSchema(value.data, overcurrentSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO overload payload", () => {
      const data = {
        data: {
          port: 12,
          payloadHex:
            "68a81dd6100100640060",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "overload");
        assert.equal(value.data.overload, true);
        assert.equal(value.data.overloadThreshold, 9.6);
        assert.equal(value.data.power, 2560);

        utils.validateSchema(value.data, overloadSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO loadstate payload", () => {
      const data = {
        data: {
          port: 13,
          payloadHex:
            "0198d0c01b77020066310814aaedaf65",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "load_state");
        assert.equal(value.data.loadState, "LOAD_STOP");

        utils.validateSchema(value.data, loadStateSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO countdown payload", () => {
      const data = {
        data: {
          port: 14,
          payloadHex:
            "68a81dd6100100000009",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "countdown");
        assert.equal(value.data.acOutputStateAfterCountdown, "ON");
        assert.equal(value.data.remainingTimeOfCountdownProcess, 9);

        utils.validateSchema(value.data, countdownSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
