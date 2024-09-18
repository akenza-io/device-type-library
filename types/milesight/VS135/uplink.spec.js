const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Milesight VS135 Uplink", () => {
  let line1Schema = null;
  let consume = null;

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/line_1.schema.json`).then((parsedSchema) => {
      line1Schema = parsedSchema;
      done();
    });
  });

  let line2Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/line_2.schema.json`).then((parsedSchema) => {
      line2Schema = parsedSchema;
      done();
    });
  });

  let line3Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/line_3.schema.json`).then((parsedSchema) => {
      line3Schema = parsedSchema;
      done();
    });
  });

  let line4Schema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/line_4.schema.json`).then((parsedSchema) => {
      line4Schema = parsedSchema;
      done();
    });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_1");
        assert.equal(value.data.totalCounterIn, 72);
        assert.equal(value.data.totalCounterOut, 200);

        utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_2");
        assert.equal(value.data.totalCounterIn, 0);
        assert.equal(value.data.totalCounterOut, 0);

        utils.validateSchema(value.data, line2Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_3");
        assert.equal(value.data.totalCounterIn, 0);
        assert.equal(value.data.totalCounterOut, 0);

        utils.validateSchema(value.data, line3Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_4");
        assert.equal(value.data.totalCounterIn, 5300);
        assert.equal(value.data.totalCounterOut, 6797);

        utils.validateSchema(value.data, line4Schema, { throwError: true });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_1");
        assert.equal(value.data.periodicCounterIn, 0);
        assert.equal(value.data.periodicCounterOut, 0);

        utils.validateSchema(value.data, line1Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_2");
        assert.equal(value.data.periodicCounterIn, 0);
        assert.equal(value.data.periodicCounterOut, 0);

        utils.validateSchema(value.data, line2Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_3");
        assert.equal(value.data.periodicCounterIn, 0);
        assert.equal(value.data.periodicCounterOut, 0);

        utils.validateSchema(value.data, line3Schema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_4");
        assert.equal(value.data.periodicCounterIn, 5);
        assert.equal(value.data.periodicCounterOut, 7);

        utils.validateSchema(value.data, line4Schema, { throwError: true });
      });

      consume(data);
    });
  });
});
