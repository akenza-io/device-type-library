const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Wattecco Triphaso uplink", () => {
  let energySchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/energy.schema.json`).then((parsedSchema) => {
      energySchema = parsedSchema;
      done();
    });
  });

  let phaseAVariablesSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/phase_a_variables.schema.json`)
      .then((parsedSchema) => {
        phaseAVariablesSchema = parsedSchema;
        done();
      });
  });

  let phaseBVariablesSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/phase_b_variables.schema.json`)
      .then((parsedSchema) => {
        phaseBVariablesSchema = parsedSchema;
        done();
      });
  });

  let phaseASchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/phase_a.schema.json`)
      .then((parsedSchema) => {
        phaseASchema = parsedSchema;
        done();
      });
  });

  let phaseBSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/phase_b.schema.json`)
      .then((parsedSchema) => {
        phaseBSchema = parsedSchema;
        done();
      });
  });

  let phaseCSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/phase_c.schema.json`)
      .then((parsedSchema) => {
        phaseCSchema = parsedSchema;
        done();
      });
  });

  let phaseABCSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/phase_abc.schema.json`)
      .then((parsedSchema) => {
        phaseABCSchema = parsedSchema;
        done();
      });
  });

  let powerSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/power.schema.json`).then((parsedSchema) => {
      powerSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Wattecco Triphaso standard payload", () => {
      const data = {
        data: {
          payloadHex:
            "710a800a000041200000317e00000999000003ed00000a420000002e00000009000000020000000f",
          port: 125,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase_abc");

        assert.equal(value.data.nActiveEnergyABC, 2457);
        assert.equal(value.data.nActivePowerWABC, 9);
        assert.equal(value.data.nReactiveEnergyABC, 2626);
        assert.equal(value.data.nReactivePowerVarABC, 15);
        assert.equal(value.data.pActiveEnergyABC, 12670);
        assert.equal(value.data.pActivePowerWABC, 46);
        assert.equal(value.data.pReactiveEnergyABC, 1005);
        assert.equal(value.data.pReactivePowerVarABC, 2);

        utils.validateSchema(value.data, phaseABCSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Wattecco Triphaso another standard payload", () => {
      const data = {
        data: {
          payloadHex:
            "110a8010000041200000051200002c14ffffd23affffc1e5ffffffe300000004ffffd72fffffedfd",
          port: 125,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "energy");

        assert.equal(value.data.activeEnergyWhPhaseA, 1298);
        assert.equal(value.data.activeEnergyWhPhaseABC, -10449);
        assert.equal(value.data.activeEnergyWhPhaseB, -11718);
        assert.equal(value.data.activeEnergyWhPhaseC, -29);
        assert.equal(value.data.reactiveEnergyWhPhaseA, 11284);
        assert.equal(value.data.reactiveEnergyWhPhaseABC, -4611);
        assert.equal(value.data.reactiveEnergyWhPhaseB, -15899);
        assert.equal(value.data.reactiveEnergyWhPhaseC, 4);

        utils.validateSchema(value.data, energySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Wattecco Triphaso phase b variables payload", () => {
      const data = {
        data: {
          payloadHex: "310a800b00004106090500010118",
          port: 125,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase_b_variables");

        assert.equal(value.data.angle, 280);
        assert.equal(value.data.irms, 1);
        assert.equal(value.data.vrms, 2309);

        utils.validateSchema(value.data, phaseBVariablesSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode Wattecco Triphaso phase a variables payload", () => {
      const data = {
        data: {
          payloadHex: "110a800b00004106090700000114",
          port: 125,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "phase_a_variables");

        assert.equal(value.data.angle, 276);
        assert.equal(value.data.irms, 0);
        assert.equal(value.data.vrms, 2311);

        utils.validateSchema(value.data, phaseAVariablesSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
