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

  let phaseVariablesSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/phase_variables.schema.json`)
      .then((parsedSchema) => {
        phaseVariablesSchema = parsedSchema;
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

  let variablesSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/variables.schema.json`)
      .then((parsedSchema) => {
        variablesSchema = parsedSchema;
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
        assert.equal(value.data.activeEnergyWhPhaseABC, -10449); //
        assert.equal(value.data.activeEnergyWhPhaseB, -11718);
        assert.equal(value.data.activeEnergyWhPhaseC, -29);
        assert.equal(value.data.reactiveEnergyWhPhaseA, 11284);
        assert.equal(value.data.reactiveEnergyWhPhaseABC, -4611); //
        assert.equal(value.data.reactiveEnergyWhPhaseB, -15899);
        assert.equal(value.data.reactiveEnergyWhPhaseC, 4);

        utils.validateSchema(value.data, energySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
