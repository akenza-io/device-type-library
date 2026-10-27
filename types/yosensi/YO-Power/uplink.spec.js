import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Power uplink", () => {
  let ch1Schema = null;
  let consume = null;
  let ch2Schema = null;
  let ch3Schema = null;
  let ch4Schema = null;
  let ch5Schema = null;
  let ch6Schema = null;
  let ct1ClampSchema = null;
  let ct2ClampSchema = null;
  let ct3ClampSchema = null;
  let ct4ClampSchema = null;
  let ct5ClampSchema = null;
  let ct6ClampSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    ch1Schema = loadSchema(`${import.meta.dirname}/ch1.schema.json`);
    ch2Schema = loadSchema(`${import.meta.dirname}/ch2.schema.json`);
    ch3Schema = loadSchema(`${import.meta.dirname}/ch3.schema.json`);
    ch4Schema = loadSchema(`${import.meta.dirname}/ch4.schema.json`);
    ch5Schema = loadSchema(`${import.meta.dirname}/ch5.schema.json`);
    ch6Schema = loadSchema(`${import.meta.dirname}/ch6.schema.json`);
    ct1ClampSchema = loadSchema(`${import.meta.dirname}/ct1_clamp.schema.json`);
    ct2ClampSchema = loadSchema(`${import.meta.dirname}/ct2_clamp.schema.json`);
    ct3ClampSchema = loadSchema(`${import.meta.dirname}/ct3_clamp.schema.json`);
    ct4ClampSchema = loadSchema(`${import.meta.dirname}/ct4_clamp.schema.json`);
    ct5ClampSchema = loadSchema(`${import.meta.dirname}/ct5_clamp.schema.json`);
    ct6ClampSchema = loadSchema(`${import.meta.dirname}/ct6_clamp.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Power (Current ch1-ch6) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "020201132e2a110102ad2e001102034d2e001103034e2e001104030d2e00110503542e001106034a",
        },
      };

      expectSample("ch1", ch1Schema, (data) => {
        assert.equal(data.ch1, 6.85);
      });

      expectSample("ch2", ch2Schema, (data) => {
        assert.equal(data.ch2, 8.45);
      });

      expectSample("ch3", ch3Schema, (data) => {
        assert.equal(data.ch3, 8.46);
      });

      expectSample("ch4", ch4Schema, (data) => {
        assert.equal(data.ch4, 7.81);
      });

      expectSample("ch5", ch5Schema, (data) => {
        assert.equal(data.ch5, 8.52);
      });

      expectSample("ch6", ch6Schema, (data) => {
        assert.equal(data.ch6, 8.42);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Power (Energy CT1-CT3 Clamps) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0203003d9a001301000000009a00130200000d949a00130300000e4c",
        },
      };

      expectSample("ct1_clamp", ct1ClampSchema, (data) => {
        assert.equal(data.ct1Clamp, 0);
      });

      expectSample("ct2_clamp", ct2ClampSchema, (data) => {
        assert.equal(data.ct2Clamp, 34.76);
      });

      expectSample("ct3_clamp", ct3ClampSchema, (data) => {
        assert.equal(data.ct3Clamp, 36.6);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Power (Energy CT4-CT6 Clamps) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "020400799a00130400000e809a00130500000df19a00130600000e1a",
        },
      };

      expectSample("ct4_clamp", ct4ClampSchema, (data) => {
        assert.equal(data.ct4Clamp, 37.12);
      });

      expectSample("ct5_clamp", ct5ClampSchema, (data) => {
        assert.equal(data.ct5Clamp, 35.69);
      });

      expectSample("ct6_clamp", ct6ClampSchema, (data) => {
        assert.equal(data.ct6Clamp, 36.1);
      });

      consume(data);
    });
  });
});
