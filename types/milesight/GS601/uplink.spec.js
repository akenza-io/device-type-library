import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Milesight GS601 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let alertSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    alertSchema = loadSchema(`${import.meta.dirname}/alert.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight GS601 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01000302000502000702000A020B43020D30000F001100",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.vapingIndex, 0);
        assert.equal(data.humidity, 57.9);
        assert.equal(data.pm1, 2);
        assert.equal(data.pm2_5, 2);
        assert.equal(data.pm10, 2);
        assert.equal(data.tvoc, 48);
      });

      expectSample("alert", alertSchema, (data) => {
        assert.equal(data.buzzer, "NORMAL");
        assert.equal(data.tamperStatus, "NORMAL");
        assert.equal(data.temperatureAlarm, "OVER_RANGE_ERROR");
      });

      consume(data);
    });
  });
});
