import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Netvox R603 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let downlinkResponseSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    downlinkResponseSchema = loadSchema(`${import.meta.dirname}/downlink_response.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Netvox R603 report payload", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "01DE012601010000000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.version, 1);
        assert.equal(data.batteryVoltage, 3.8);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.warning, true);
      });

      consume(data);
    });

    it("should decode Netvox R603 report payload", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "01DE010000000000000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.version, 1);
        assert.equal(data.contactSwitchStatus, false);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.warning, false);
      });

      consume(data);
    });

    it("should decode Netvox R603 downlink response payload", () => {
      const data = {
        data: {
          port: 7,
          payloadHex: "84DE000000000000000000",
        },
      };

      expectSample("downlink_response", downlinkResponseSchema, (data) => {
        assert.equal(data.configurationSuccess, true);
      });

      consume(data);
    });
  });
});
