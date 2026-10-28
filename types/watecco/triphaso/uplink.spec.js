import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Wattecco Triphaso uplink", () => {
  let energySchema = null;
  let consume = null;
  let phaseAVariablesSchema = null;
  let phaseBVariablesSchema = null;
  let phaseASchema = null;
  let phaseBSchema = null;
  let phaseCSchema = null;
  let phaseABCSchema = null;
  let powerSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    energySchema = loadSchema(`${import.meta.dirname}/energy.schema.json`);
    phaseAVariablesSchema = loadSchema(`${import.meta.dirname}/phase_a_variables.schema.json`);
    phaseBVariablesSchema = loadSchema(`${import.meta.dirname}/phase_b_variables.schema.json`);
    phaseASchema = loadSchema(`${import.meta.dirname}/phase_a.schema.json`);
    phaseBSchema = loadSchema(`${import.meta.dirname}/phase_b.schema.json`);
    phaseCSchema = loadSchema(`${import.meta.dirname}/phase_c.schema.json`);
    phaseABCSchema = loadSchema(`${import.meta.dirname}/phase_abc.schema.json`);
    powerSchema = loadSchema(`${import.meta.dirname}/power.schema.json`);
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

      expectSample("phase_abc", phaseABCSchema, (data) => {
        assert.equal(data.nActiveEnergyABC, 2457);
        assert.equal(data.nActivePowerWABC, 9);
        assert.equal(data.nReactiveEnergyABC, 2626);
        assert.equal(data.nReactivePowerVarABC, 15);
        assert.equal(data.pActiveEnergyABC, 12670);
        assert.equal(data.pActivePowerWABC, 46);
        assert.equal(data.pReactiveEnergyABC, 1005);
        assert.equal(data.pReactivePowerVarABC, 2);
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

      expectSample("energy", energySchema, (data) => {
        assert.equal(data.activeEnergyWhPhaseA, 1298);
        assert.equal(data.activeEnergyWhPhaseABC, -10449);
        assert.equal(data.activeEnergyWhPhaseB, -11718);
        assert.equal(data.activeEnergyWhPhaseC, -29);
        assert.equal(data.reactiveEnergyWhPhaseA, 11284);
        assert.equal(data.reactiveEnergyWhPhaseABC, -4611);
        assert.equal(data.reactiveEnergyWhPhaseB, -15899);
        assert.equal(data.reactiveEnergyWhPhaseC, 4);
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

      expectSample("phase_b_variables", phaseBVariablesSchema, (data) => {
        assert.equal(data.angle, 280);
        assert.equal(data.irms, 1);
        assert.equal(data.vrms, 2309);
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

      expectSample("phase_a_variables", phaseAVariablesSchema, (data) => {
        assert.equal(data.angle, 276);
        assert.equal(data.irms, 0);
        assert.equal(data.vrms, 2311);
      });

      consume(data);
    });
  });
});
