import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Analog uplink", () => {
  let ch1Schema = null;
  let consume = null;
  let ch2Schema = null;
  let ch3Schema = null;
  let ch4Schema = null;
  let ch5Schema = null;
  let ch6Schema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    ch1Schema = loadSchema(`${import.meta.dirname}/ch1.schema.json`);
    ch2Schema = loadSchema(`${import.meta.dirname}/ch2.schema.json`);
    ch3Schema = loadSchema(`${import.meta.dirname}/ch3.schema.json`);
    ch4Schema = loadSchema(`${import.meta.dirname}/ch4.schema.json`);
    ch5Schema = loadSchema(`${import.meta.dirname}/ch5.schema.json`);
    ch6Schema = loadSchema(`${import.meta.dirname}/ch6.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Analog payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "020000362e001101025d2e001102025b2e00110302583200110401e13200110501e33200110601e2",
        },
      };

      expectSample("ch1", ch1Schema, (data) => {
        assert.equal(data.ch1, 6.05);
      });

      expectSample("ch2", ch2Schema, (data) => {
        assert.equal(data.ch2, 6.03);
      });

      expectSample("ch3", ch3Schema, (data) => {
        assert.equal(data.ch3, 6.0);
      });

      expectSample("ch4", ch4Schema, (data) => {
        assert.equal(data.ch4, 4.81);
      });

      expectSample("ch5", ch5Schema, (data) => {
        assert.equal(data.ch5, 4.83);
      });

      expectSample("ch6", ch6Schema, (data) => {
        assert.equal(data.ch6, 4.82);
      });

      consume(data);
    });
  });
});
