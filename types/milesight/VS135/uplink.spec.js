import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Milesight VS135 Uplink", () => {
  let line1Schema = null;
  let consume = null;
  let line2Schema = null;
  let line3Schema = null;
  let line4Schema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    line1Schema = loadSchema(`${import.meta.dirname}/line_1.schema.json`);
    line2Schema = loadSchema(`${import.meta.dirname}/line_2.schema.json`);
    line3Schema = loadSchema(`${import.meta.dirname}/line_3.schema.json`);
    line4Schema = loadSchema(`${import.meta.dirname}/line_4.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight VS135 Total payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "03d24800000004d2c800000006d20000000007d20000000009d2000000000ad2000000000cd2b41400000dd28d1a0000",
        },
      };

      expectSample("line_1", line1Schema, (data) => {
        assert.equal(data.totalCounterIn, 72);
        assert.equal(data.totalCounterOut, 200);
      });

      expectSample("line_2", line2Schema, (data) => {
        assert.equal(data.totalCounterIn, 0);
        assert.equal(data.totalCounterOut, 0);
      });

      expectSample("line_3", line3Schema, (data) => {
        assert.equal(data.totalCounterIn, 0);
        assert.equal(data.totalCounterOut, 0);
      });

      expectSample("line_4", line4Schema, (data) => {
        assert.equal(data.totalCounterIn, 5300);
        assert.equal(data.totalCounterOut, 6797);
      });

      consume(data);
    });

    it("should decode should decode the Milesight VS135 Periodic payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "05cc0000000008cc000000000bcc000000000ecc05000700",
        },
      };

      expectSample("line_1", line1Schema, (data) => {
        assert.equal(data.periodicCounterIn, 0);
        assert.equal(data.periodicCounterOut, 0);
      });

      expectSample("line_2", line2Schema, (data) => {
        assert.equal(data.periodicCounterIn, 0);
        assert.equal(data.periodicCounterOut, 0);
      });

      expectSample("line_3", line3Schema, (data) => {
        assert.equal(data.periodicCounterIn, 0);
        assert.equal(data.periodicCounterOut, 0);
      });

      expectSample("line_4", line4Schema, (data) => {
        assert.equal(data.periodicCounterIn, 5);
        assert.equal(data.periodicCounterOut, 7);
      });

      consume(data);
    });
  });
});
