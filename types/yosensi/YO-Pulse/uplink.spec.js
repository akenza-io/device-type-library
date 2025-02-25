const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Pulse uplink", () => {
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

  describe("consume()", () => {
    it("should decode the Yosensi YO Pulse payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "027000210400111100010400111200010400111300006000110401f46000110501f46000110601f4",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH1");
        assert.equal(value.data.CH1, 1);

        utils.validateSchema(value.data, CH1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH2");
        assert.equal(value.data.CH2, 1);

        utils.validateSchema(value.data, CH2Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH3");
        assert.equal(value.data.CH3, 0);

        utils.validateSchema(value.data, CH3Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH4");
        assert.equal(value.data.CH4, 500);

        utils.validateSchema(value.data, CH4Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH5");
        assert.equal(value.data.CH5, 500);

        utils.validateSchema(value.data, CH5Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "CH6");
        assert.equal(value.data.CH6, 500);

        utils.validateSchema(value.data, CH6Schema, { throwError: true });
      });

      consume(data);
    });
  });
});
