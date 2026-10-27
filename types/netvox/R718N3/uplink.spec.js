
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Netvox R718N3 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let versionSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    versionSchema = loadSchema(`${import.meta.dirname}/version.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the first raw R718N3 payload", () => {
      const data = {
        state: {},
        data: {
          port: 1,
          payloadHex: "014a01243f803fb03f8001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");

        assert.equal(value.current1, 16256);
        assert.equal(value.current2, 16304);
        assert.equal(value.current3, 16256);
        assert.equal(value.multiplier1, 1);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.6);
      });

      consume(data);
    });

    it("should decode the second raw R718N3 payload", () => {
      const data = {
        state: {
          current1: 16256,
          current2: 16304,
          current3: 16256,
          multiplier1: 1,
        },
        data: {
          port: 1,
          payloadHex: "014a022401010000000000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.current1, 16.256);
        assert.equal(data.current2, 16.304);
        assert.equal(data.current3, 16.256);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.6);
      });

      consume(data);
    });

    it("should decode the verion R718N3 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "014a000A012017050300",
        },
      };

      expectSample("lifecycle", versionSchema, (data) => {
        assert.equal(data.softwareVersion, 10);
        assert.equal(data.hardwareVersion, 1);
        assert.equal(data.dataCode, "20170503");
      });

      consume(data);
    });

    it("should decode the combined message R718N3 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "014A032405DC36B080E824",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.current1, 1.5);
        assert.equal(data.current2, 70);
        assert.equal(data.current3, 330);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.6);
      });

      consume(data);
    });
  });
});
