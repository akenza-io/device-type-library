

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Ewattch squid hc lorawan", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the ewattch squid hc lorawan default uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "002548509F06A03E0D407D1AF56900EAD300D4A701509F06A03E0D407D1AF56900EAD300D4A701",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.channel1, 4.34);
        assert.equal(value.data.channel2, 8.68);
        assert.equal(value.data.channel3, 17.36);
        assert.equal(value.data.channel4, 0.27125);
        assert.equal(value.data.channel5, 0.5425);
        assert.equal(value.data.channel6, 1.085);
        assert.equal(value.data.channel7, 4.34);
        assert.equal(value.data.channel8, 8.68);
        assert.equal(value.data.channel9, 17.36);
        assert.equal(value.data.channel10, 0.27125);
        assert.equal(value.data.channel11, 0.5425);
        assert.equal(value.data.channel12, 1.085);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the ewattch squid hc lorawan status uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "100A00080204010408083C00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.batteryStatus, "NORMAL");
        assert.equal(value.data.firmware, "1.4");
        assert.equal(value.data.periodicity, 60);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
