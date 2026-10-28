import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Digital matter Guppy Uplink", () => {
  let statusSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    statusSchema = loadSchema(`${import.meta.dirname}/status.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the digital matter Guppy short payload, port 1", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "C382",
        },
      };

      expectSample("status", statusSchema, (data) => {
        assert.equal(data.inTrip, true);
        assert.equal(data.temperature, 25);
        assert.equal(data.batteryVoltage, 3.358);
      });

      consume(data);
    });

    it("should decode the digital matter Guppy long payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "C38245B1",
        },
      };

      expectSample("status", statusSchema, (data) => {
        assert.equal(data.inTrip, true);
        assert.equal(data.temperature, 25);
        assert.equal(data.batteryVoltage, 3.36);

        assert.equal(data.inclinationDeg, 51);
        assert.equal(data.azimuthDeg, 265.5);
        assert.equal(data.downUnit[0], -0.7748);
        assert.equal(data.downUnit[1], 0.6293);
        assert.equal(data.downUnit[2], -0.06097);

        assert.equal(data.manDown, true);
        assert.equal(data.xyzAzimuthDeg[0], 354.5);
        assert.equal(data.xyzAzimuthDeg[1], 265.5);
        assert.equal(data.xyzAzimuthDeg[2], 140.9);

        assert.equal(data.xyzInclinationDeg[0], 140.8);
        assert.equal(data.xyzInclinationDeg[1], 51);
        assert.equal(data.xyzInclinationDeg[2], 93.5);
      });

      consume(data);
    });
  });
});
