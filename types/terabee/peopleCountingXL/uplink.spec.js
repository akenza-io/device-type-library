import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Terabee people counting XL Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.fw, 0);
        assert.equal(value.data.bw, 0);
        assert.equal(value.data.absoluteFw, 23);
        assert.equal(value.data.absoluteBw, 12);

        validateSchema(value.data, defaultSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.wifiApEnabled, true);
        assert.equal(value.data.multiDevIssue, true);
        assert.equal(value.data.tpcStuck, true);
        assert.equal(value.data.tpcStopped, true);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.fw, 0);
        assert.equal(value.data.bw, 0);
        assert.equal(value.data.absoluteFw, 2);
        assert.equal(value.data.absoluteBw, 3);

        validateSchema(value.data, defaultSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.wifiApEnabled, true);
        assert.equal(value.data.multiDevIssue, true);
        assert.equal(value.data.tpcStuck, true);
        assert.equal(value.data.tpcStopped, true);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.fw, 0);
        assert.equal(value.data.bw, 0);
        assert.equal(value.data.absoluteFw, 2);
        assert.equal(value.data.absoluteBw, 3);

        validateSchema(value.data, defaultSchema, { throwError: true });
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
          lastBw: 0,
        },
        data: {
          port: 1,
          payloadHex: "00000002000000030f",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.wifiApEnabled, true);
        assert.equal(value.data.multiDevIssue, true);
        assert.equal(value.data.tpcStuck, true);
        assert.equal(value.data.tpcStopped, true);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.fw, 1);
        assert.equal(value.data.bw, 3);
        assert.equal(value.data.absoluteFw, 2);
        assert.equal(value.data.absoluteBw, 3);

        validateSchema(value.data, defaultSchema, { throwError: true });
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
