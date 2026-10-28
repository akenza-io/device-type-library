import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("CT305 Uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  let systemSchema = null;
  let channel1Schema = null;
  let channel2Schema = null;
  let channel3Schema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    channel1Schema = loadSchema(`${import.meta.dirname}/channel1.schema.json`);
    channel2Schema = loadSchema(`${import.meta.dirname}/channel2.schema.json`);
    channel3Schema = loadSchema(`${import.meta.dirname}/channel3.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the CT305 system payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FF0BFFFF0101FF166746D38802580000FF090100FF0A0101FF0F00FFFF0101",
        },
      };

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.firmwareVersion, "1.1");
        assert.equal(data.hardwareVersion, "1.0");
        assert.equal(data.ipsoVersion, "0.1");
        assert.equal(data.powerOn, true);
        assert.equal(data.sn, "6746d38802580000");
        assert.equal(data.tslVersion, "1.1");
      });

      consume(data);
    });

    it("should decode should decode the CT305 totalCurrent payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "039710270000",
        },
      };

      expectSample("channel1", channel1Schema, (data) => {
        assert.equal(data.totalCurrent, 100);
      });

      consume(data);
    });

    it("should decode should decode the CT305 alarm payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "8499B80BD007C40905",
        },
      };

      expectSample("channel1", channel1Schema, (data) => {
        assert.deepEqual(data.alarm, ["THRESHOLD_ALARM", "OVER_RANGE_ALARM"]);
        assert.equal(data.current, 250);
        assert.equal(data.currentMax, 300);
        assert.equal(data.currentMin, 200);
      });

      consume(data);
    });
  });
});
