import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Laiier severnWLD Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let startUpSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    startUpSchema = loadSchema(`${import.meta.dirname}/start_up.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Laiier severnWLD startup payload", () => {
      const data = {
        data: {
          port: 100,
          payloadHex: "2319010600000272010000",
        },
      };

      expectSample("start_up", startUpSchema, (data) => {
        assert.equal(data.firmwareVersion, "1.0.0");
        assert.equal(data.serialNumber, 2529053791026676000);
      });

      consume(data);
    });

    it("should decode Laiier severnWLD self test payload", () => {
      const data = {
        data: {
          port: 102,
          payloadHex: "0000fd023f18030168",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.criticalWetFlag, false);
        assert.equal(data.interval, 360);
        assert.equal(data.leakElectrode1, false);
        assert.equal(data.leakElectrode2, false);
        assert.equal(data.leakElectrode3, false);
        assert.equal(data.leakElectrode4, false);
        assert.equal(data.leakElectrode5, false);
        assert.equal(data.leakElectrode6, false);
        assert.equal(data.leakElectrode7, false);
        assert.equal(data.leakElectrode8, false);
        assert.equal(data.leakElectrode9, false);
        assert.equal(data.leakElectrode10, false);
        assert.equal(data.leakElectrode11, false);
        assert.equal(data.leakElectrode12, false);
        assert.equal(data.messageType, "SELF_TEST_MESSAGE");
        assert.equal(data.selfTestFailed, false);
        assert.equal(data.temperature, 24);
        assert.equal(data.wetnessThreshold, 3);
      });

      consume(data);
    });
  });
});
