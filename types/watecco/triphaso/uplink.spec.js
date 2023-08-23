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

  let phaseSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/phase.schema.json`).then((parsedSchema) => {
      phaseSchema = parsedSchema;
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

        assert.equal(value.topic, "phase");

        assert.equal(value.data.nActiveEnergy, 2457);
        assert.equal(value.data.nActivePowerW, 9);
        assert.equal(value.data.nReactiveEnergy, 2626);
        assert.equal(value.data.nReactivePowerVar, 15);
        assert.equal(value.data.pActiveEnergy, 12670);
        assert.equal(value.data.pActivePowerW, 46);
        assert.equal(value.data.pReactiveEnergy, 1005);
        assert.equal(value.data.pReactivePowerVar, 2);

        utils.validateSchema(value.data, phaseSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
