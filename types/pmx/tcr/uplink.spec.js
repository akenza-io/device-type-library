

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("PMX TCR Uplinks", () => {
  let consume = null;

  let idSchema = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/id.schema.json`)
      .then((parsedSchema) => {
        idSchema = parsedSchema;
        done();
      });
  });

  let udcSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/udc.schema.json`)
      .then((parsedSchema) => {
        udcSchema = parsedSchema;
        done();
      });
  });

  let cat1Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/cat1.schema.json`)
      .then((parsedSchema) => {
        cat1Schema = parsedSchema;
        done();
      });
  });

  let cat2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/cat2.schema.json`)
      .then((parsedSchema) => {
        cat2Schema = parsedSchema;
        done();
      });
  });

  let cat3Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/cat3.schema.json`)
      .then((parsedSchema) => {
        cat3Schema = parsedSchema;
        done();
      });
  });

  let cat4Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/cat4.schema.json`)
      .then((parsedSchema) => {
        cat4Schema = parsedSchema;
        done();
      });
  });


  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });


  describe("consume()", () => {
    it("should decode the PMX TCR id payload", () => {
      const data = {
        data: {
          port: 190,
          payloadHex: "d20a020211004200",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "id");
        assert.equal(value.data.type, "TCR-DLI");
        assert.equal(value.data.licence, "PRO");
        assert.equal(value.data.speedClass, "HS");
        assert.equal(value.data.firmware, "1.1.0");
        assert.equal(value.data.sbx, "4.2.0");

        validateSchema(value.data, idSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "udc");
        assert.equal(value.data.ltrCounter, 1000);
        assert.equal(value.data.ltrSpeed, 50);
        assert.equal(value.data.rtlCounter, 1100);
        assert.equal(value.data.rtlSpeed, 52);

        validateSchema(value.data, udcSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 5.1);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "cat1");
        assert.equal(value.data.ltrCounter, 1000);
        assert.equal(value.data.ltrSpeed, 50);
        assert.equal(value.data.rtlCounter, 1100);
        assert.equal(value.data.rtlSpeed, 52);

        validateSchema(value.data, cat1Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 5.1);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "cat2");
        assert.equal(value.data.ltrCounter, 1000);
        assert.equal(value.data.ltrSpeed, 50);
        assert.equal(value.data.rtlCounter, 1100);
        assert.equal(value.data.rtlSpeed, 52);

        validateSchema(value.data, cat2Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 5.1);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "cat3");
        assert.equal(value.data.ltrCounter, 1000);
        assert.equal(value.data.ltrSpeed, 50);
        assert.equal(value.data.rtlCounter, 1100);
        assert.equal(value.data.rtlSpeed, 52);

        validateSchema(value.data, cat3Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 5.1);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "cat4");
        assert.equal(value.data.ltrCounter, 1000);
        assert.equal(value.data.ltrSpeed, 50);
        assert.equal(value.data.rtlCounter, 1100);
        assert.equal(value.data.rtlSpeed, 52);

        validateSchema(value.data, cat4Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 5.1);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

  });


});


