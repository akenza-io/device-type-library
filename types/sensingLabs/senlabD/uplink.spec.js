import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Senlab SenlabD uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let startupSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    startupSchema = loadSchema(`${import.meta.dirname}/startup.schema.json`);
  });

  describe("consume()", () => {
    it("Should decode Senlab SenlabD payload", () => {
      const data = {
        data: {
          port: 4,
          payloadHex: "0067f110a080d5b37044020002030406030000000102",
        },
      };

      expectSample("startup", startupSchema, (data) => {
        assert.equal(data.version, "2.0.2");
        assert.equal(data.openDuration, 0);
        assert.equal(data.closeDuration, 1);
      });

      consume(data);
    });

    it("Should decode Senlab SenlabD payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "05f503030317cfd115",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.open, false);
        assert.equal(data.batteryLevel, 96);
      });

      consume(data);
    });
  });
});
