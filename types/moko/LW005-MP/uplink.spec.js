

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Moko LW005-MP Uplink", () => {
  let countdownSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/countdown.schema.json`).then((parsedSchema) => {
      countdownSchema = parsedSchema;
      done();
    });
  });


  let energySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/energy.schema.json`)
      .then((parsedSchema) => {
        energySchema = parsedSchema;
        done();
      });
  });

  let consumptionSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/consumption.schema.json`)
      .then((parsedSchema) => {
        consumptionSchema = parsedSchema;
        done();
      });
  });

  let loadStateSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/load_state.schema.json`)
      .then((parsedSchema) => {
        loadStateSchema = parsedSchema;
        done();
      });
  });

  let overcurrentSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/overcurrent.schema.json`)
      .then((parsedSchema) => {
        overcurrentSchema = parsedSchema;
        done();
      });
  });

  let overloadSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/overload.schema.json`)
      .then((parsedSchema) => {
        overloadSchema = parsedSchema;
        done();
      });
  });

  let overvoltageSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/overvoltage.schema.json`)
      .then((parsedSchema) => {
        overvoltageSchema = parsedSchema;
        done();
      });
  });

  let powerSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/power.schema.json`)
      .then((parsedSchema) => {
        powerSchema = parsedSchema;
        done();
      });
  });

  let switchSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/switch.schema.json`)
      .then((parsedSchema) => {
        switchSchema = parsedSchema;
        done();
      });
  });

  let undervoltageSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/undervoltage.schema.json`)
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "switch");
        assert.equal(value.data.acOutputState, "OFF");
        assert.equal(value.data.plugLoadStatus, "NO_LOAD");

        validateSchema(value.data, switchSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO energy payload", () => {
      const data = {
        data: {
          port: 6,
          payloadHex:
            "68a7ecfa1008b70000c32d",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "energy");
        assert.equal(value.data.current, 0);
        assert.equal(value.data.voltage, 223.1);
        assert.equal(value.data.frequency, 49.965);

        validateSchema(value.data, energySchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "power");
        assert.equal(value.data.activePower, 0);
        assert.equal(value.data.powerFactor, 100);

        validateSchema(value.data, powerSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Moko LW001-BG-PRO consumption payload", () => {
      const data = {
        data: {
          port: 8,
          payloadHex:
            "68a81dd6100000020a0000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "consumption");
        assert.equal(value.data.consumptionLastHour, 0);
        assert.equal(value.data.totalConsumption, 0.163125);

        validateSchema(value.data, consumptionSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "overvoltage");
        assert.equal(value.data.overvoltage, true);
        assert.equal(value.data.overvoltageThreshold, 220);
        assert.equal(value.data.voltage, 330);

        validateSchema(value.data, overvoltageSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "undervoltage");
        assert.equal(value.data.undervoltage, true);
        assert.equal(value.data.undervoltageThreshold, 220);
        assert.equal(value.data.voltage, 210);

        validateSchema(value.data, undervoltageSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "overcurrent");
        assert.equal(value.data.overcurrent, true);
        assert.equal(value.data.overcurrentThreshold, 0.998);
        assert.equal(value.data.current, 1);

        validateSchema(value.data, overcurrentSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "overload");
        assert.equal(value.data.overload, true);
        assert.equal(value.data.overloadThreshold, 9.6);
        assert.equal(value.data.power, 2560);

        validateSchema(value.data, overloadSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "load_state");
        assert.equal(value.data.loadState, "LOAD_STOP");

        validateSchema(value.data, loadStateSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "countdown");
        assert.equal(value.data.acAfterCountdown, "ON");
        assert.equal(value.data.countdownTime, 9);

        validateSchema(value.data, countdownSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
