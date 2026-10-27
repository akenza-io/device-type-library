import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Ewattch squid hc lorawan", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the ewattch squid hc lorawan default uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "002548509F06A03E0D407D1AF56900EAD300D4A701509F06A03E0D407D1AF56900EAD300D4A701",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.channel1, 4.34);
        assert.equal(data.channel2, 8.68);
        assert.equal(data.channel3, 17.36);
        assert.equal(data.channel4, 0.27125);
        assert.equal(data.channel5, 0.5425);
        assert.equal(data.channel6, 1.085);
        assert.equal(data.channel7, 4.34);
        assert.equal(data.channel8, 8.68);
        assert.equal(data.channel9, 17.36);
        assert.equal(data.channel10, 0.27125);
        assert.equal(data.channel11, 0.5425);
        assert.equal(data.channel12, 1.085);
      });

      consume(data);
    });

    it("should decode the ewattch squid hc lorawan status uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "100A00080204010408083C00",
        },
      };

      expectSample("status", lifecycleSchema, (data) => {
        assert.equal(data.batteryStatus, "NORMAL");
        assert.equal(data.firmware, "1.4");
        assert.equal(data.periodicity, 60);
      });

      consume(data);
    });
  });
});
