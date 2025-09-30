import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yosensi YO Meter Reader 2.0 uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/battery_voltage.schema.json`).then(
      (parsedSchema) => {
        batteryVoltageSchema = parsedSchema;
        done();
      },
    );
  });

  let internalTemperatureSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/internal_temperature.schema.json`).then(
      (parsedSchema) => {
        internalTemperatureSchema = parsedSchema;
        done();
      },
    );
  });

  let humiditySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/humidity.schema.json`).then((parsedSchema) => {
      humiditySchema = parsedSchema;
      done();
    });
  });

  let periodicPulseCntSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/periodic_pulse_cnt.schema.json`).then(
      (parsedSchema) => {
        periodicPulseCntSchema = parsedSchema;
        done();
      },
    );
  });

  let persistentPulseCntSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/persistent_pulse_cnt.schema.json`).then(
      (parsedSchema) => {
        persistentPulseCntSchema = parsedSchema;
        done();
      },
    );
  });

  let totalUnitsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/total_units.schema.json`).then((parsedSchema) => {
      totalUnitsSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Meter Reader 2.0 payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "023e000108000111980d000100f3100000205c00070000024100009e6d99000300000029",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4504);

        validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 24.3);
        assert.equal(value.data.internalTemperatureF, 75.7);

        validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 32);

        validateSchema(value.data, humiditySchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "periodic_pulse_cnt");
        assert.equal(value.data.periodicPulseCnt, 577);

        validateSchema(value.data, periodicPulseCntSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "persistent_pulse_cnt");
        assert.equal(value.data.persistentPulseCnt, 40557);

        validateSchema(value.data, persistentPulseCntSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "total_units");
        assert.equal(value.data.totalUnits, 4.1);

        validateSchema(value.data, totalUnitsSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
