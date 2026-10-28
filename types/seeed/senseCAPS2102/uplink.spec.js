import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Seeed SenseCAP 2102 Light Intensity Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP2102 Light Intensity Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010310A8550200E3E9",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.light, 153);
      });

      consume(data);
    });
  });
});
