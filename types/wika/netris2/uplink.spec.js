import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Wika Netris2 Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Wika Netris1 standard uplink", () => {
      const data = {
        device: {
          customFields: {
            rangeStart: 0,
            rangeEnd: 25,
          }
        },
        data: {
          port: 1,
          payloadHex:
            "01020311ff1220",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.channel1, 5.2675);
        assert.equal(data.channel2, 5.3500000000000005);
        assert.equal(data.delta, -0.08250000000000046);
        assert.equal(data.deltaReverse, 0.08250000000000046);
        assert.equal(data.ongoingAlarm, false);
      });

      consume(data);
    });
  });
});
