

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Milesight VS133 Uplink", () => {
  let line1Schema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/line_1.schema.json`).then((parsedSchema) => {
      line1Schema = parsedSchema;
      done();
    });
  });

  let line2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/line_2.schema.json`).then((parsedSchema) => {
      line2Schema = parsedSchema;
      done();
    });
  });

  let line3Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/line_3.schema.json`).then((parsedSchema) => {
      line3Schema = parsedSchema;
      done();
    });
  });

  let line4Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/line_4.schema.json`).then((parsedSchema) => {
      line4Schema = parsedSchema;
      done();
    });
  });

  let regionCountSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/region_count.schema.json`)
      .then((parsedSchema) => {
        regionCountSchema = parsedSchema;
        done();
      });
  });

  let dwellTimeSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/dwell_time.schema.json`)
      .then((parsedSchema) => {
        dwellTimeSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight VS133 Total payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "03d24800000004d2c800000006d20000000007d20000000009d2000000000ad2000000000cd2b41400000dd28d1a0000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_1");
        assert.equal(value.data.totalCounterIn, 72);
        assert.equal(value.data.totalCounterOut, 200);

        validateSchema(value.data, line1Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_2");
        assert.equal(value.data.totalCounterIn, 0);
        assert.equal(value.data.totalCounterOut, 0);

        validateSchema(value.data, line2Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_3");
        assert.equal(value.data.totalCounterIn, 0);
        assert.equal(value.data.totalCounterOut, 0);

        validateSchema(value.data, line3Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_4");
        assert.equal(value.data.totalCounterIn, 5300);
        assert.equal(value.data.totalCounterOut, 6797);

        validateSchema(value.data, line4Schema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the Milesight VS133 Periodic payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "05cc0000000008cc000000000bcc000000000ecc05000700",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_1");
        assert.equal(value.data.periodicCounterIn, 0);
        assert.equal(value.data.periodicCounterOut, 0);

        validateSchema(value.data, line1Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_2");
        assert.equal(value.data.periodicCounterIn, 0);
        assert.equal(value.data.periodicCounterOut, 0);

        validateSchema(value.data, line2Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_3");
        assert.equal(value.data.periodicCounterIn, 0);
        assert.equal(value.data.periodicCounterOut, 0);

        validateSchema(value.data, line3Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_4");
        assert.equal(value.data.periodicCounterIn, 5);
        assert.equal(value.data.periodicCounterOut, 7);

        validateSchema(value.data, line4Schema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the Milesight VS133 1 Line", () => {
      const data = {
        data: {
          port: 85,
          payloadHex: "03d2d915000004d25514000005cc00000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_1");
        assert.equal(value.data.periodicCounterIn, 0);
        assert.equal(value.data.periodicCounterOut, 0);
        assert.equal(value.data.totalCounterIn, 5593);
        assert.equal(value.data.totalCounterOut, 5205);

        validateSchema(value.data, line1Schema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the Milesight VS133 Region count payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0FE302100709",
        },
      };

      expectEmits((type, value) => {
        assert.equal(value.topic, "region_count");
        assert.equal(value.data.region1Count, 2);
        assert.equal(value.data.region2Count, 16);
        assert.equal(value.data.region3Count, 7);
        assert.equal(value.data.region4Count, 9);

        validateSchema(value.data, regionCountSchema, {
          throwError: true,
        });
      });
      consume(data);
    });

    it("should decode should decode the Milesight VS133 Dwell time payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "10E4010910112110E4027521753310E4038121238910E40476001387",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "dwell_time");
        assert.equal(value.data.region1AvgDwell, 4105);
        assert.equal(value.data.region1MaxDwell, 8465);
        assert.equal(value.data.region2AvgDwell, 8565);
        assert.equal(value.data.region2MaxDwell, 13173);
        assert.equal(value.data.region3AvgDwell, 8577);
        assert.equal(value.data.region3MaxDwell, 35107);
        assert.equal(value.data.region4AvgDwell, 118);
        assert.equal(value.data.region4MaxDwell, 34579);

        validateSchema(value.data, dwellTimeSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
