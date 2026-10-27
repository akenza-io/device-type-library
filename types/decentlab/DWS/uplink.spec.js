import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Decentlab DWS Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Decentlab DWS payload & init state", () => {
      const data = {
        state: {},
        device: {
          customFields: {
            force: 9.8067,
            underLoad: 0.0000000475,
            strain: 0.066,
          },
        },
        data: {
          payloadHex: "0203d400033bf67fff3bf60c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.frequency, 15350.47);
        assert.equal(data.weight, 11.26);
        assert.equal(data.weightKg, 0.0113);
        assert.equal(data.relativeWeightGram, 0);
        assert.equal(data.relativeWeightKilogramm, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceId, 980);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastWeighting, 11.26);
      });

      consume(data);
    });

    it("should decode Decentlab DWS payload & give out increment", () => {
      const data = {
        state: { lastWeighting: 5 },
        device: {
          customFields: {
            force: 9.8067,
            underLoad: 0.0000000475,
            strain: 0.066,
          },
        },
        data: {
          payloadHex: "0203d400033bf67fff3bf60c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.frequency, 15350.47);
        assert.equal(data.weight, 11.26);
        assert.equal(data.weightKg, 0.0113);
        assert.equal(data.relativeWeightGram, 6.26);
        assert.equal(data.relativeWeightKilogramm, 0.0063);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceId, 980);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastWeighting, 11.26);
      });

      consume(data);
    });
  });
});
