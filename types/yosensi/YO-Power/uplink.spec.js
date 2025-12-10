import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yosensi YO Power uplink", () => {
  let ch1Schema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/ch1.schema.json`).then((parsedSchema) => {
      ch1Schema = parsedSchema;
      done();
    });
  });

  let ch2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/ch2.schema.json`).then((parsedSchema) => {
      ch2Schema = parsedSchema;
      done();
    });
  });

  let ch3Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/ch3.schema.json`).then((parsedSchema) => {
      ch3Schema = parsedSchema;
      done();
    });
  });

  let ch4Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/ch4.schema.json`).then((parsedSchema) => {
      ch4Schema = parsedSchema;
      done();
    });
  });

  let ch5Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/ch5.schema.json`).then((parsedSchema) => {
      ch5Schema = parsedSchema;
      done();
    });
  });

  let ch6Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/ch6.schema.json`).then((parsedSchema) => {
      ch6Schema = parsedSchema;
      done();
    });
  });

  let ct1ClampSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/ct1_clamp.schema.json`).then((parsedSchema) => {
      ct1ClampSchema = parsedSchema;
      done();
    });
  });

  let ct2ClampSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/ct2_clamp.schema.json`).then((parsedSchema) => {
      ct2ClampSchema = parsedSchema;
      done();
    });
  });

  let ct3ClampSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/ct3_clamp.schema.json`).then((parsedSchema) => {
      ct3ClampSchema = parsedSchema;
      done();
    });
  });

  let ct4ClampSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/ct4_clamp.schema.json`).then((parsedSchema) => {
      ct4ClampSchema = parsedSchema;
      done();
    });
  });

  let ct5ClampSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/ct5_clamp.schema.json`).then((parsedSchema) => {
      ct5ClampSchema = parsedSchema;
      done();
    });
  });

  let ct6ClampSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/ct6_clamp.schema.json`).then((parsedSchema) => {
      ct6ClampSchema = parsedSchema;
      done();
    });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch1");
        assert.equal(value.data.ch1, 6.85);

        validateSchema(value.data, ch1Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch2");
        assert.equal(value.data.ch2, 8.45);

        validateSchema(value.data, ch2Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch3");
        assert.equal(value.data.ch3, 8.46);

        validateSchema(value.data, ch3Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch4");
        assert.equal(value.data.ch4, 7.81);

        validateSchema(value.data, ch4Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch5");
        assert.equal(value.data.ch5, 8.52);

        validateSchema(value.data, ch5Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch6");
        assert.equal(value.data.ch6, 8.42);

        validateSchema(value.data, ch6Schema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ct1_clamp");
        assert.equal(value.data.ct1Clamp, 0);

        validateSchema(value.data, ct1ClampSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ct2_clamp");
        assert.equal(value.data.ct2Clamp, 34.76);

        validateSchema(value.data, ct2ClampSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ct3_clamp");
        assert.equal(value.data.ct3Clamp, 36.6);

        validateSchema(value.data, ct3ClampSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ct4_clamp");
        assert.equal(value.data.ct4Clamp, 37.12);

        validateSchema(value.data, ct4ClampSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ct5_clamp");
        assert.equal(value.data.ct5Clamp, 35.69);

        validateSchema(value.data, ct5ClampSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ct6_clamp");
        assert.equal(value.data.ct6Clamp, 36.1);

        validateSchema(value.data, ct6ClampSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
