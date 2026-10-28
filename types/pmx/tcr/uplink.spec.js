import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("PMX TCR Uplinks", () => {
  let consume = null;
  let idSchema = null;
  let udcSchema = null;
  let cat1Schema = null;
  let cat2Schema = null;
  let cat3Schema = null;
  let cat4Schema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    idSchema = loadSchema(`${import.meta.dirname}/id.schema.json`);
    udcSchema = loadSchema(`${import.meta.dirname}/udc.schema.json`);
    cat1Schema = loadSchema(`${import.meta.dirname}/cat1.schema.json`);
    cat2Schema = loadSchema(`${import.meta.dirname}/cat2.schema.json`);
    cat3Schema = loadSchema(`${import.meta.dirname}/cat3.schema.json`);
    cat4Schema = loadSchema(`${import.meta.dirname}/cat4.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });


  describe("consume()", () => {
    it("should decode the PMX TCR id payload", () => {
      const data = {
        data: {
          port: 190,
          payloadHex: "d20a020211004200",
        },
      };

      expectSample("id", idSchema, (data) => {
        assert.equal(data.type, "TCR-DLI");
        assert.equal(data.licence, "PRO");
        assert.equal(data.speedClass, "HS");
        assert.equal(data.firmware, "1.1.0");
        assert.equal(data.sbx, "4.2.0");
      });

      consume(data);
    });

  });

  describe("consume()", () => {
    it("should decode the PMX TCR udc payload", () => {
      const data = {
        data: {
          port: 13,
          payloadHex: "a2140a03e832044c3433",
        },
      };

      expectSample("udc", udcSchema, (data) => {
        assert.equal(data.ltrCounter, 1000);
        assert.equal(data.ltrSpeed, 50);
        assert.equal(data.rtlCounter, 1100);
        assert.equal(data.rtlSpeed, 52);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 5.1);
      });

      consume(data);
    });

  });

  describe("consume()", () => {
    it("should decode the PMX TCR cat1 payload", () => {
      const data = {
        data: {
          port: 14,
          payloadHex: "a2140a03e832044c3433",
        },
      };

      expectSample("cat1", cat1Schema, (data) => {
        assert.equal(data.ltrCounter, 1000);
        assert.equal(data.ltrSpeed, 50);
        assert.equal(data.rtlCounter, 1100);
        assert.equal(data.rtlSpeed, 52);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 5.1);
      });

      consume(data);
    });

  });

  describe("consume()", () => {
    it("should decode the PMX TCR cat2 payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex: "a2140a03e832044c3433",
        },
      };

      expectSample("cat2", cat2Schema, (data) => {
        assert.equal(data.ltrCounter, 1000);
        assert.equal(data.ltrSpeed, 50);
        assert.equal(data.rtlCounter, 1100);
        assert.equal(data.rtlSpeed, 52);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 5.1);
      });

      consume(data);
    });

  });

  describe("consume()", () => {
    it("should decode the PMX TCR cat3 payload", () => {
      const data = {
        data: {
          port: 16,
          payloadHex: "a2140a03e832044c3433",
        },
      };

      expectSample("cat3", cat3Schema, (data) => {
        assert.equal(data.ltrCounter, 1000);
        assert.equal(data.ltrSpeed, 50);
        assert.equal(data.rtlCounter, 1100);
        assert.equal(data.rtlSpeed, 52);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 5.1);
      });

      consume(data);
    });

  });

  describe("consume()", () => {
    it("should decode the PMX TCR cat4 payload", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "a2140a03e832044c3433",
        },
      };

      expectSample("cat4", cat4Schema, (data) => {
        assert.equal(data.ltrCounter, 1000);
        assert.equal(data.ltrSpeed, 50);
        assert.equal(data.rtlCounter, 1100);
        assert.equal(data.rtlSpeed, 52);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 5.1);
      });

      consume(data);
    });

  });


});


