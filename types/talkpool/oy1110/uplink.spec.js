import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Talkpool OY1110 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let startupSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    startupSchema = loadSchema(`${import.meta.dirname}/startup.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Talkpool OY1110 report uplink", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "0f2e3ccd3338d23931f5",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, -5.2);
        assert.equal(data.humidity, 72.3);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 2.9);
        assert.equal(data.humidity, 64.8);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 12.7);
        assert.equal(data.humidity, 53.9);
      });

      consume(data);
    });

    describe("consume()", () => {
      it("should decode the Talkpool OY1110 report uplink", () => {
        const data = {
          data: {
            port: 2,
            payloadHex: "4424ee",
          },
        };

        expectSample("default", defaultSchema, (data) => {
          assert.equal(data.temperature, 30.2);
          assert.equal(data.humidity, 34);
        });

        consume(data);
      });
    });

    describe("consume()", () => {
      it("should decode the Talkpool OY1110 uplink", () => {
        const data = {
          data: {
            port: 1,
            payloadHex: "012000",
          },
        };

        expectSample("startup", startupSchema, (data) => {
          assert.equal(data.message, "STARTUP_OK");
        });

        consume(data);
      });
    });
  });
});
