

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("VS121 Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let countSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/count.schema.json`).then((parsedSchema) => {
      countSchema = parsedSchema;
      done();
    });
  });

  let peopleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/people.schema.json`).then((parsedSchema) => {
      peopleSchema = parsedSchema;
      done();
    });
  });

  let peopleMaxSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/people_max.schema.json`)
      .then((parsedSchema) => {
        peopleMaxSchema = parsedSchema;
        done();
      });
  });

  let aFlowSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/a_flow.schema.json`).then((parsedSchema) => {
      aFlowSchema = parsedSchema;
      done();
    });
  });

  let bFlowSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/b_flow.schema.json`).then((parsedSchema) => {
      bFlowSchema = parsedSchema;
      done();
    });
  });

  let cFlowSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/c_flow.schema.json`).then((parsedSchema) => {
      cFlowSchema = parsedSchema;
      done();
    });
  });

  let dFlowSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/d_flow.schema.json`).then((parsedSchema) => {
      dFlowSchema = parsedSchema;
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

  let regionCountSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/region_count.schema.json`)
      .then((parsedSchema) => {
        regionCountSchema = parsedSchema;
        done();
      });
  });

  let totalSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/total.schema.json`).then((parsedSchema) => {
      totalSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode should decode the VS121 lifecycle payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FF08660012345678",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.sn, 660012345678);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the VS121 count payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "04C903030002",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "count");
        assert.equal(value.data.peopleCounterAll, 3);
        assert.equal(value.data.region0, 0);
        assert.equal(value.data.region1, 1);
        assert.equal(value.data.region2, 0);
        assert.equal(value.data.regionCount, 3);
        validateSchema(value.data, countSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the VS121 people payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "05CC02000100",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "people");
        assert.equal(value.data.in, 2);
        assert.equal(value.data.out, 1);

        validateSchema(value.data, peopleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the VS121 peopleMax payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "06CD05",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "people_max");
        assert.equal(value.data.peopleMax, 5);

        validateSchema(value.data, peopleMaxSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the VS121 flows payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "09DA00010002000000000ADA00000000000000000BDA00000000000000120CDA0000000000000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "a_flow");
        assert.equal(value.data.aToA, 256);
        assert.equal(value.data.aToB, 512);
        assert.equal(value.data.aToC, 0);
        assert.equal(value.data.aToD, 0);

        validateSchema(value.data, aFlowSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "b_flow");
        assert.equal(value.data.bToA, 0);
        assert.equal(value.data.bToB, 0);
        assert.equal(value.data.bToC, 0);
        assert.equal(value.data.bToD, 0);

        validateSchema(value.data, bFlowSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "c_flow");
        assert.equal(value.data.cToA, 0);
        assert.equal(value.data.cToB, 0);
        assert.equal(value.data.cToC, 0);
        assert.equal(value.data.cToD, 4608);

        validateSchema(value.data, cFlowSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "d_flow");
        assert.equal(value.data.dToA, 0);
        assert.equal(value.data.dToB, 0);
        assert.equal(value.data.dToC, 0);
        assert.equal(value.data.dToD, 0);

        validateSchema(value.data, dFlowSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the VS121 region count payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "07D5000100000000000308D50100000000000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "region_count");
        assert.equal(value.data.region1count, 0);
        assert.equal(value.data.region2count, 1);
        assert.equal(value.data.region3count, 0);
        assert.equal(value.data.region4count, 0);
        assert.equal(value.data.region5count, 0);
        assert.equal(value.data.region6count, 0);
        assert.equal(value.data.region7count, 0);
        assert.equal(value.data.region8count, 3);
        assert.equal(value.data.region9count, 1);
        assert.equal(value.data.region10count, 0);
        assert.equal(value.data.region11count, 0);
        assert.equal(value.data.region12count, 0);
        assert.equal(value.data.region13count, 0);
        assert.equal(value.data.region14count, 0);
        assert.equal(value.data.region15count, 0);
        assert.equal(value.data.region16count, 0);

        validateSchema(value.data, regionCountSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
