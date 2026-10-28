import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Astraled Air Quality Luminary V0.02 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });
  describe("consume()", () => {
    it("should decode the Astraled Air Quality Luminary V0.02 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "042a0000803f042b54ca2d41022cfa000223110001320302091109020a4601020b3d01020c9802010e00",
        },
      };
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.actPwr, 1);
        assert.equal(data.energy, 10.861896514892578);
        assert.equal(data.iaqStateInt, 0);
        assert.equal(data.sensorAmbientLight, 250);
      });
      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.lightState, 17);
        assert.equal(data.temperature, 23.21);
        assert.equal(data.humidity, 32.6);
        assert.equal(data.voc, 317);
        assert.equal(data.co2, 664);
      });
      consume(data);
    });
  });
});
