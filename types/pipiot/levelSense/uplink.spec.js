import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Pipiot levelSense uplink", () => {
  let extSchema = null;
  let consume = null;
  let defaultSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    extSchema = loadSchema(`${import.meta.dirname}/ext.schema.json`);
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Pipiot levelSense payload", () => {
      const data = {
        data: {
          payloadHex: "3000001060d701d219049d02",
        },
      };

      expectSample("ext", extSchema, (data) => {
        assert.equal(data.ultrasonicDistanceExt, 838);
        assert.equal(data.laserDistanceExt, 43);
      });

      expectSample("default", defaultSchema, (data) => {

        assert.equal(data.laserReflectance, 119296);
        assert.equal(data.temperature, 25);
        assert.equal(data.tiltAngle, 4);
      });

      consume(data);
    });
  });
});
