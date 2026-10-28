import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Terabee people counting XL Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Terabee people counting XL HTTP payload", () => {
      const data = {
        data: {
          count_in: 23,
          count_out: 12,
          timestamp: "165776767",
          device_id: "FA21415EAEB7",
          username: "user",
          password: "password",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.fw, 0);
        assert.equal(data.bw, 0);
        assert.equal(data.absoluteFw, 23);
        assert.equal(data.absoluteBw, 12);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastFw, 23);
        assert.equal(value.lastBw, 12);
      });

      consume(data);
    });

    it("should decode Terabee people counting XL LoRa payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "00000002000000030f",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.wifiApEnabled, true);
        assert.equal(data.multiDevIssue, true);
        assert.equal(data.tpcStuck, true);
        assert.equal(data.tpcStopped, true);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.fw, 0);
        assert.equal(data.bw, 0);
        assert.equal(data.absoluteFw, 2);
        assert.equal(data.absoluteBw, 3);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastFw, 2);
        assert.equal(value.lastBw, 3);
      });

      consume(data);
    });

    it("should decode Terabee people counting XL LoRa payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "00000002000000030f",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.wifiApEnabled, true);
        assert.equal(data.multiDevIssue, true);
        assert.equal(data.tpcStuck, true);
        assert.equal(data.tpcStopped, true);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.fw, 0);
        assert.equal(data.bw, 0);
        assert.equal(data.absoluteFw, 2);
        assert.equal(data.absoluteBw, 3);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastFw, 2);
        assert.equal(value.lastBw, 3);
      });

      consume(data);
    });

    it("should decode Terabee people counting XL LoRa payload and give out a relative payload", () => {
      const data = {
        state: {
          lastFw: 1,
          lastBw: 0
        },
        data: {
          port: 1,
          payloadHex: "00000002000000030f",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.wifiApEnabled, true);
        assert.equal(data.multiDevIssue, true);
        assert.equal(data.tpcStuck, true);
        assert.equal(data.tpcStopped, true);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.fw, 1);
        assert.equal(data.bw, 3);
        assert.equal(data.absoluteFw, 2);
        assert.equal(data.absoluteBw, 3);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastFw, 2);
        assert.equal(value.lastBw, 3);
      });

      consume(data);
    });
  });
});
