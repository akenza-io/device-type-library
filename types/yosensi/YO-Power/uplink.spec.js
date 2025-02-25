const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Power uplink", () => {
  let CH1Schema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/CH1.schema.json`).then((parsedSchema) => {
      CH1Schema = parsedSchema;
      done();
    });
  });

  let CH2Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/CH2.schema.json`).then((parsedSchema) => {
      CH2Schema = parsedSchema;
      done();
    });
  });

  let CH3Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/CH3.schema.json`).then((parsedSchema) => {
      CH3Schema = parsedSchema;
      done();
    });
  });

  let CH4Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/CH4.schema.json`).then((parsedSchema) => {
      CH4Schema = parsedSchema;
      done();
    });
  });

  let CH5Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/CH5.schema.json`).then((parsedSchema) => {
      CH5Schema = parsedSchema;
      done();
    });
  });

  let CH6Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/CH6.schema.json`).then((parsedSchema) => {
      CH6Schema = parsedSchema;
      done();
    });
  });

  let CT1ClampSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/CT1Clamp.schema.json`)
      .then((parsedSchema) => {
        CT1ClampSchema = parsedSchema;
        done();
      });
  });

  let CT2ClampSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/CT2Clamp.schema.json`)
      .then((parsedSchema) => {
        CT2ClampSchema = parsedSchema;
        done();
      });
  });

  let CT3ClampSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/CT3Clamp.schema.json`)
      .then((parsedSchema) => {
        CT3ClampSchema = parsedSchema;
        done();
      });
  });

  let CT4ClampSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/CT4Clamp.schema.json`)
      .then((parsedSchema) => {
        CT4ClampSchema = parsedSchema;
        done();
      });
  });

  let CT5ClampSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/CT5Clamp.schema.json`)
      .then((parsedSchema) => {
        CT5ClampSchema = parsedSchema;
        done();
      });
  });

  let CT6ClampSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/CT6Clamp.schema.json`)
      .then((parsedSchema) => {
        CT6ClampSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Power (Current CH1-CH6) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "020201132e2a110102ad2e001102034d2e001103034e2e001104030d2e00110503542e001106034a",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH1");
        assert.equal(value.data.CH1, 6.85);

        utils.validateSchema(value.data, CH1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH2");
        assert.equal(value.data.CH2, 8.45);

        utils.validateSchema(value.data, CH2Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH3");
        assert.equal(value.data.CH3, 8.46);

        utils.validateSchema(value.data, CH3Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH4");
        assert.equal(value.data.CH4, 7.81);

        utils.validateSchema(value.data, CH4Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH5");
        assert.equal(value.data.CH5, 8.52);

        utils.validateSchema(value.data, CH5Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH6");
        assert.equal(value.data.CH6, 8.42);

        utils.validateSchema(value.data, CH6Schema, { throwError: true });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CT1Clamp");
        assert.equal(value.data.CT1Clamp, 0);

        utils.validateSchema(value.data, CT1ClampSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CT2Clamp");
        assert.equal(value.data.CT2Clamp, 34.76);

        utils.validateSchema(value.data, CT2ClampSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CT3Clamp");
        assert.equal(value.data.CT3Clamp, 36.6);

        utils.validateSchema(value.data, CT3ClampSchema, { throwError: true });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CT4Clamp");
        assert.equal(value.data.CT4Clamp, 37.12);

        utils.validateSchema(value.data, CT4ClampSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CT5Clamp");
        assert.equal(value.data.CT5Clamp, 35.69);

        utils.validateSchema(value.data, CT5ClampSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CT6Clamp");
        assert.equal(value.data.CT6Clamp, 36.1);

        utils.validateSchema(value.data, CT6ClampSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
