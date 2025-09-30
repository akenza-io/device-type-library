import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Dragino LHT65N Uplink", () => {
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

  let externalSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/external.schema.json`).then((parsedSchema) => {
      externalSchema = parsedSchema;
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

  let datalogSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/datalog.schema.json`).then((parsedSchema) => {
      datalogSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Dragino LHT65 empty uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "0d20000000000001",
        },
      };

      consume(data);
    });

    it("should decode the Dragino LHT65N report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "cc5609c001ec01096c7fff",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryStatus, "GOOD");
        assert.equal(value.data.batteryVoltage, 3.158);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.humidity, 49.2);
        assert.equal(value.data.temperature, 24.96);
        assert.equal(value.data.temperatureF, 76.9);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "external");
        assert.equal(value.data.tempDS, 24.12);
        assert.equal(value.data.tempDSF, 75.4);

        validateSchema(value.data, externalSchema, { throwError: true });
      });

      consume(data);
    });
  });

  it("should decode the Dragino LHT65N report uplink", () => {
    const data = {
      data: {
        port: 2,
        payloadHex: "CCB5026C039F010A857FFF",
      },
    };

    expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "lifecycle");
      assert.equal(value.data.batteryStatus, "GOOD");
      assert.equal(value.data.batteryVoltage, 3.253);
      assert.equal(value.data.batteryLevel, 100);

      validateSchema(value.data, lifecycleSchema, { throwError: true });
    });

    expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "default");
      assert.equal(value.data.humidity, 92.7);
      assert.equal(value.data.temperature, 6.2);
      assert.equal(value.data.temperatureF, 43.2);

      validateSchema(value.data, defaultSchema, { throwError: true });
    });

    expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "external");
      assert.equal(value.data.tempDS, 26.93);
      assert.equal(value.data.tempDSF, 80.5);

      validateSchema(value.data, externalSchema, { throwError: true });
    });

    consume(data);
  });
});
