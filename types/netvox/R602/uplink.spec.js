import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Netvox R602 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let downlinkResponseSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    downlinkResponseSchema = loadSchema(`${import.meta.dirname}/downlink_response.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Netvox R603 report payload", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "0169010E10000000000000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.warning, false);
        assert.equal(data.heartbeat, 3600);
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
