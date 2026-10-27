import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("WS558 Uplink", () => {
  let defaultSchema = null;
  let switchSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    switchSchema = loadSchema(`${import.meta.dirname}/switch.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WS558 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0831000105816407C902000374B208068301000000048001000000",
        },
      };

      expectSample("switch", switchSchema, (data) => {
        assert.equal(data.switch1, true);
        assert.equal(data.switch2, false);
        assert.equal(data.switch3, false);
        assert.equal(data.switch4, false);
        assert.equal(data.switch5, false);
        assert.equal(data.switch6, false);
        assert.equal(data.switch7, false);
        assert.equal(data.switch8, false);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.voltage, 222.6);
        assert.equal(data.activePower, 1);
        assert.equal(data.powerFactor, 100);
        assert.equal(data.powerConsumption, 1);
        assert.equal(data.totalCurrent, 2);
      });

      consume(data);
    });
  });
});
