const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Watecco Flash'O Uplink", () => {
  let phase1Schema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/phase1.schema.json`).then((parsedSchema) => {
      phase1Schema = parsedSchema;
      done();
    });
  });

  let phase2Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/phase2.schema.json`).then((parsedSchema) => {
      phase2Schema = parsedSchema;
      done();
    });
  });

  let phase3Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/phase3.schema.json`).then((parsedSchema) => {
      phase3Schema = parsedSchema;
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

  describe("consume()", () => {
    it("should decode the Watecco Flash'O 3 Phases uplink & state init", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "3606001146b300005c51b10708684b923d408052f31e",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase1");
        assert.equal(value.data.pulse, 23633);
        assert.equal(value.data.relativePulse, 0);

        utils.validateSchema(value.data, phase1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase2");
        assert.equal(value.data.pulse, 93513);
        assert.equal(value.data.relativePulse, 0);

        utils.validateSchema(value.data, phase2Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase3");
        assert.equal(value.data.pulse, 84685);
        assert.equal(value.data.relativePulse, 0);

        utils.validateSchema(value.data, phase3Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse1, 23633);
        assert.equal(value.lastPulse2, 93513);
        assert.equal(value.lastPulse3, 84685);
      });

      consume(data);
    });

    it("should decode the Watecco Flash'O 3 Phases uplink, with customfields and state", () => {
      const data = {
        device: {
          customFields: {
            pulseType1: "consumption",
            multiplier1: 15,
            divider1: 250,
            pulseType2: "consumption",
            multiplier2: 8,
            divider2: 500,
            pulseType3: "consumption",
            multiplier3: 3,
            divider3: 250,
          },
        },
        state: {
          lastPulse1: 20633,
          lastPulse2: 93013,
          lastPulse3: 84485,
        },
        data: {
          port: 125,
          payloadHex: "3606001146b300005c51b10708684b923d408052f31e",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase1");
        assert.equal(value.data.pulse, 23633);
        assert.equal(value.data.relativePulse, 3000);
        assert.equal(value.data.consumption, 180);
        assert.equal(value.data.consumptionCumulative, 1417.98);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase2");
        assert.equal(value.data.pulse, 93513);
        assert.equal(value.data.relativePulse, 500);
        assert.equal(value.data.consumption, 8);
        assert.equal(value.data.consumptionCumulative, 1496.208);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase3");
        assert.equal(value.data.pulse, 84685);
        assert.equal(value.data.relativePulse, 200);
        assert.equal(value.data.consumption, 2.4);
        assert.equal(value.data.consumptionCumulative, 1016.22);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse1, 23633);
        assert.equal(value.lastPulse2, 93513);
        assert.equal(value.lastPulse3, 84685);
      });

      consume(data);
    });

    it("should decode the Watecco Flash'O 1 Phase uplink & state init", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "110a000f04022300001226",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase1");
        assert.equal(value.data.pulse, 4646);
        assert.equal(value.data.relativePulse, 0);

        utils.validateSchema(value.data, phase1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse1, 4646);
      });

      consume(data);
    });

    it("should decode the Watecco Flash'O 1 Phase uplink, with customfields and state", () => {
      const data = {
        device: {
          customFields: {
            pulseType1: "consumption",
            multiplier1: 15,
            divider1: 250,
          },
        },
        state: {
          lastPulse1: 4346,
        },
        data: {
          port: 125,
          payloadHex: "110a000f04022300001226",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase1");
        assert.equal(value.data.pulse, 4646);
        assert.equal(value.data.consumption, 18);
        assert.equal(value.data.consumptionCumulative, 278.76);
        assert.equal(value.data.relativePulse, 300);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse1, 4646);
      });

      consume(data);
    });

    it("should decode the Watecco Flash'O lifecycle uplink, with customfields and state", () => {
      const data = {
        device: {
          customFields: {
            pulseType1: "consumption",
            multiplier1: 15,
            divider1: 250,
          },
        },
        state: {
          lastPulse1: 4646,
        },
        data: {
          port: 125,
          payloadHex: "110a00500006410501040e5404",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.668);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse1, 4646);
      });

      consume(data);
    });

    it("should decode the Watecco Flash'O Phase 3 uplink & state init", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "510a000f04022300000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase3");
        assert.equal(value.data.pulse, 0);
        assert.equal(value.data.relativePulse, 0);

        utils.validateSchema(value.data, phase3Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse3, 0);
      });

      consume(data);
    });
  });
});
