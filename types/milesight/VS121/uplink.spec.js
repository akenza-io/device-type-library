import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("VS121 Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  let countSchema = null;
  let peopleSchema = null;
  let peopleMaxSchema = null;
  let aFlowSchema = null;
  let bFlowSchema = null;
  let cFlowSchema = null;
  let dFlowSchema = null;
  let dwellTimeSchema = null;
  let regionCountSchema = null;
  let totalSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    countSchema = loadSchema(`${import.meta.dirname}/count.schema.json`);
    peopleSchema = loadSchema(`${import.meta.dirname}/people.schema.json`);
    peopleMaxSchema = loadSchema(`${import.meta.dirname}/people_max.schema.json`);
    aFlowSchema = loadSchema(`${import.meta.dirname}/a_flow.schema.json`);
    bFlowSchema = loadSchema(`${import.meta.dirname}/b_flow.schema.json`);
    cFlowSchema = loadSchema(`${import.meta.dirname}/c_flow.schema.json`);
    dFlowSchema = loadSchema(`${import.meta.dirname}/d_flow.schema.json`);
    dwellTimeSchema = loadSchema(`${import.meta.dirname}/dwell_time.schema.json`);
    regionCountSchema = loadSchema(`${import.meta.dirname}/region_count.schema.json`);
    totalSchema = loadSchema(`${import.meta.dirname}/total.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the VS121 lifecycle payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FF08660012345678",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.sn, 660012345678);
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

      expectSample("count", countSchema, (data) => {
        assert.equal(data.peopleCounterAll, 3);
        assert.equal(data.region0, 0);
        assert.equal(data.region1, 1);
        assert.equal(data.region2, 0);
        assert.equal(data.regionCount, 3);
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

      expectSample("people", peopleSchema, (data) => {
        assert.equal(data.in, 2);
        assert.equal(data.out, 1);
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

      expectSample("people_max", peopleMaxSchema, (data) => {
        assert.equal(data.peopleMax, 5);
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

      expectSample("a_flow", aFlowSchema, (data) => {
        assert.equal(data.aToA, 256);
        assert.equal(data.aToB, 512);
        assert.equal(data.aToC, 0);
        assert.equal(data.aToD, 0);
      });

      expectSample("b_flow", bFlowSchema, (data) => {
        assert.equal(data.bToA, 0);
        assert.equal(data.bToB, 0);
        assert.equal(data.bToC, 0);
        assert.equal(data.bToD, 0);
      });

      expectSample("c_flow", cFlowSchema, (data) => {
        assert.equal(data.cToA, 0);
        assert.equal(data.cToB, 0);
        assert.equal(data.cToC, 0);
        assert.equal(data.cToD, 4608);
      });

      expectSample("d_flow", dFlowSchema, (data) => {
        assert.equal(data.dToA, 0);
        assert.equal(data.dToB, 0);
        assert.equal(data.dToC, 0);
        assert.equal(data.dToD, 0);
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

      expectSample("region_count", regionCountSchema, (data) => {
        assert.equal(data.region1count, 0);
        assert.equal(data.region2count, 1);
        assert.equal(data.region3count, 0);
        assert.equal(data.region4count, 0);
        assert.equal(data.region5count, 0);
        assert.equal(data.region6count, 0);
        assert.equal(data.region7count, 0);
        assert.equal(data.region8count, 3);
        assert.equal(data.region9count, 1);
        assert.equal(data.region10count, 0);
        assert.equal(data.region11count, 0);
        assert.equal(data.region12count, 0);
        assert.equal(data.region13count, 0);
        assert.equal(data.region14count, 0);
        assert.equal(data.region15count, 0);
        assert.equal(data.region16count, 0);
      });

      consume(data);
    });
  });
});
