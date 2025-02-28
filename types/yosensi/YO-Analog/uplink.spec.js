const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Analog uplink", () => {
  let ch1Schema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/ch1.schema.json`).then((parsedSchema) => {
      ch1Schema = parsedSchema;
      done();
    });
  });

  let ch2Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/ch2.schema.json`).then((parsedSchema) => {
      ch2Schema = parsedSchema;
      done();
    });
  });

  let ch3Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/ch3.schema.json`).then((parsedSchema) => {
      ch3Schema = parsedSchema;
      done();
    });
  });

  let ch4Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/ch4.schema.json`).then((parsedSchema) => {
      ch4Schema = parsedSchema;
      done();
    });
  });

  let ch5Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/ch5.schema.json`).then((parsedSchema) => {
      ch5Schema = parsedSchema;
      done();
    });
  });

  let ch6Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/ch6.schema.json`).then((parsedSchema) => {
      ch6Schema = parsedSchema;
      done();
    });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch1");
        assert.equal(value.data.ch1, 6.05);

        utils.validateSchema(value.data, ch1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch2");
        assert.equal(value.data.ch2, 6.03);

        utils.validateSchema(value.data, ch2Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch3");
        assert.equal(value.data.ch3, 6.0);

        utils.validateSchema(value.data, ch3Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch4");
        assert.equal(value.data.ch4, 4.81);

        utils.validateSchema(value.data, ch4Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch5");
        assert.equal(value.data.ch5, 4.83);

        utils.validateSchema(value.data, ch5Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ch6");
        assert.equal(value.data.ch6, 4.82);

        utils.validateSchema(value.data, ch6Schema, { throwError: true });
      });

      consume(data);
    });
  });
});
