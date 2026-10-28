import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";

describe("Milesight VS133 Uplink", () => {
  let line1Schema = null;
  let consume = null;
  let line2Schema = null;
  let line3Schema = null;
  let line4Schema = null;
  let regionCountSchema = null;
  let dwellTimeSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    line1Schema = loadSchema(`${import.meta.dirname}/line_1.schema.json`);
    line2Schema = loadSchema(`${import.meta.dirname}/line_2.schema.json`);
    line3Schema = loadSchema(`${import.meta.dirname}/line_3.schema.json`);
    line4Schema = loadSchema(`${import.meta.dirname}/line_4.schema.json`);
    regionCountSchema = loadSchema(`${import.meta.dirname}/region_count.schema.json`);
    dwellTimeSchema = loadSchema(`${import.meta.dirname}/dwell_time.schema.json`);
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

      expectSample("line_1", line1Schema, (data) => {
        assert.equal(data.totalCounterIn, 72);
        assert.equal(data.totalCounterOut, 200);
      });

      expectSample("line_2", line2Schema, (data) => {
        assert.equal(data.totalCounterIn, 0);
        assert.equal(data.totalCounterOut, 0);
      });

      expectSample("line_3", line3Schema, (data) => {
        assert.equal(data.totalCounterIn, 0);
        assert.equal(data.totalCounterOut, 0);
      });

      expectSample("line_4", line4Schema, (data) => {
        assert.equal(data.totalCounterIn, 5300);
        assert.equal(data.totalCounterOut, 6797);
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

      expectSample("line_1", line1Schema, (data) => {
        assert.equal(data.periodicCounterIn, 0);
        assert.equal(data.periodicCounterOut, 0);
      });

      expectSample("line_2", line2Schema, (data) => {
        assert.equal(data.periodicCounterIn, 0);
        assert.equal(data.periodicCounterOut, 0);
      });

      expectSample("line_3", line3Schema, (data) => {
        assert.equal(data.periodicCounterIn, 0);
        assert.equal(data.periodicCounterOut, 0);
      });

      expectSample("line_4", line4Schema, (data) => {
        assert.equal(data.periodicCounterIn, 5);
        assert.equal(data.periodicCounterOut, 7);
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

      expectSample("line_1", line1Schema, (data) => {
        assert.equal(data.periodicCounterIn, 0);
        assert.equal(data.periodicCounterOut, 0);
        assert.equal(data.totalCounterIn, 5593);
        assert.equal(data.totalCounterOut, 5205);
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

      expectSample("dwell_time", dwellTimeSchema, (data) => {
        assert.equal(data.region1AvgDwell, 4105);
        assert.equal(data.region1MaxDwell, 8465);
        assert.equal(data.region2AvgDwell, 8565);
        assert.equal(data.region2MaxDwell, 13173);
        assert.equal(data.region3AvgDwell, 8577);
        assert.equal(data.region3MaxDwell, 35107);
        assert.equal(data.region4AvgDwell, 118);
        assert.equal(data.region4MaxDwell, 34579);
      });

      consume(data);
    });
  });
});
