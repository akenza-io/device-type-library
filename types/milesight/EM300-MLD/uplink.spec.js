
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("EM300-MLD Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the EM300-MLD payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01755C050000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 92);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.leakage, false);
      });

      consume(data);
    });

    it("should decode should decode the EM300-MLD history payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "20CE9E74466300000001",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.leakage, true);
      });

      consume(data);
    });
  });
});
