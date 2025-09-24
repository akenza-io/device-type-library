
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
describe("Aplha Omega Technologoy KlaxV2 Uplink", () => {
  let register1Schema = null;
  let register2Schema = null;
  let register3Schema = null;
  let register4Schema = null;
  let lifecycleSchema = null;
  let registerSearchSchema = null;
  let registerSetSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/register_1.schema.json`)
      .then((parsedSchema) => {
        register1Schema = parsedSchema;
        done();
      });
  });
  before((done) => {
    loadSchema(`${__dirname}/register_2.schema.json`)
      .then((parsedSchema) => {
        register2Schema = parsedSchema;
        done();
      });
  });
  before((done) => {
    loadSchema(`${__dirname}/register_3.schema.json`)
      .then((parsedSchema) => {
        register3Schema = parsedSchema;
        done();
      });
  });
  before((done) => {
    loadSchema(`${__dirname}/register_4.schema.json`)
      .then((parsedSchema) => {
        register4Schema = parsedSchema;
        done();
      });
  });
  before((done) => {
    loadSchema(`${__dirname}/register_search.schema.json`)
      .then((parsedSchema) => {
        registerSearchSchema = parsedSchema;
        done();
      });
  });
  before((done) => {
    loadSchema(`${__dirname}/register_set.schema.json`)
      .then((parsedSchema) => {
        registerSetSchema = parsedSchema;
        done();
      });
  });
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });
  describe("consume()", () => {
    it("should decode the Aplha Omega Technologoy KlaxV2 App payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex:
            "0445BD11030A014C475A00028131F701110F46A4100046A4100046A4100046A4100001130F46A4100046A4100046A4100046A4100001150F46A4100046A4100046A4100046A4100001170F46A4100046A4100046A4100046A41000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "register_1");
        assert.equal(value.data.filterPositionActive, true);
        assert.equal(value.data.filterPositionUnit, "Wh");

        assert.equal(value.data.dataPointValid, true);
        assert.equal(value.data.dataPoint1Valid, true);
        assert.equal(value.data.dataPoint2Valid, true);
        assert.equal(value.data.dataPoint3Valid, true);

        assert.equal(value.data.dataPoint, 21000);
        assert.equal(value.data.dataPoint1, 21000);
        assert.equal(value.data.dataPoint2, 21000);
        assert.equal(value.data.dataPoint3, 21000);

        validateSchema(value.data, register1Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "register_2");
        assert.equal(value.data.filterPositionActive, true);
        assert.equal(value.data.filterPositionUnit, "Wh");

        assert.equal(value.data.dataPointValid, true);
        assert.equal(value.data.dataPoint1Valid, true);
        assert.equal(value.data.dataPoint2Valid, true);
        assert.equal(value.data.dataPoint3Valid, true);

        assert.equal(value.data.dataPoint, 21000);
        assert.equal(value.data.dataPoint1, 21000);
        assert.equal(value.data.dataPoint2, 21000);
        assert.equal(value.data.dataPoint3, 21000);

        validateSchema(value.data, register2Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "register_3");
        assert.equal(value.data.filterPositionActive, true);
        assert.equal(value.data.filterPositionUnit, "Wh");

        assert.equal(value.data.dataPointValid, true);
        assert.equal(value.data.dataPoint1Valid, true);
        assert.equal(value.data.dataPoint2Valid, true);
        assert.equal(value.data.dataPoint3Valid, true);

        assert.equal(value.data.dataPoint, 21000);
        assert.equal(value.data.dataPoint1, 21000);
        assert.equal(value.data.dataPoint2, 21000);
        assert.equal(value.data.dataPoint3, 21000);

        validateSchema(value.data, register3Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "register_4");
        assert.equal(value.data.filterPositionActive, true);
        assert.equal(value.data.filterPositionUnit, "Wh");

        assert.equal(value.data.dataPointValid, true);
        assert.equal(value.data.dataPoint1Valid, true);
        assert.equal(value.data.dataPoint2Valid, true);
        assert.equal(value.data.dataPoint3Valid, true);

        assert.equal(value.data.dataPoint, 21000);
        assert.equal(value.data.dataPoint1, 21000);
        assert.equal(value.data.dataPoint2, 21000);
        assert.equal(value.data.dataPoint3, 21000);

        validateSchema(value.data, register4Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.connectionTest, false);
        assert.equal(value.data.registersConfigured, true);
        assert.equal(value.data.deviceType, "SML_KLAX");
        assert.equal(value.data.payloadVersion, 4);
        assert.equal(value.data.readingMode, "SML_MODE");
        assert.equal(value.data.serverID, "0A014C475A00028131F7");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });
      consume(data);
    });

    it("should decode the Aplha Omega Technologoy KlaxV2 Config payload", () => {
      const data = {
        data: {
          port: 100,
          payloadHex: "0445000F",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.connectionTest, false);
        assert.equal(value.data.registersConfigured, true);
        assert.equal(value.data.deviceType, "SML_KLAX");
        assert.equal(value.data.payloadVersion, 4);
        assert.equal(value.data.readingMode, "SML_MODE");
        assert.equal(value.data.measurementInterval, 15);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });
      consume(data);
    });

    it("should decode the Aplha Omega Technologoy KlaxV2 Info payload", () => {
      const data = {
        data: {
          port: 101,
          payloadHex: "04450103",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.connectionTest, false);
        assert.equal(value.data.registersConfigured, true);
        assert.equal(value.data.deviceType, "SML_KLAX");
        assert.equal(value.data.payloadVersion, 4);
        assert.equal(value.data.readingMode, "SML_MODE");
        assert.equal(value.data.appVersion, "1.3");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });
      consume(data);
    });

    it("should decode the Aplha Omega Technologoy KlaxV2 Reg Search payload", () => {
      const data = {
        data: {
          port: 103,
          payloadHex: "0445C011010800010802",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "register_search");
        assert.equal(value.data.register1ID, "1.8.0");
        assert.equal(value.data.register2ID, "1.8.2");

        validateSchema(value.data, registerSearchSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.connectionTest, false);
        assert.equal(value.data.registersConfigured, true);
        assert.equal(value.data.deviceType, "SML_KLAX");
        assert.equal(value.data.payloadVersion, 4);
        assert.equal(value.data.readingMode, "SML_MODE");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });
      consume(data);
    });

    it("should decode the Aplha Omega Technologoy KlaxV2 Reg set payload", () => {
      const data = {
        data: {
          port: 104,
          payloadHex: "044503010800020800000000000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "register_set");

        assert.equal(value.data.registerFilter1Set, true);
        assert.equal(value.data.registerFilter2Set, true);
        assert.equal(value.data.registerFilter3Set, false);
        assert.equal(value.data.registerFilter4Set, false);

        assert.equal(value.data.registerFilter1ID, "1.8.0");
        assert.equal(value.data.registerFilter2ID, "2.8.0");
        assert.equal(value.data.registerFilter3ID, "0.0.0");
        assert.equal(value.data.registerFilter4ID, "0.0.0");

        validateSchema(value.data, registerSetSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.connectionTest, false);
        assert.equal(value.data.registersConfigured, true);
        assert.equal(value.data.deviceType, "SML_KLAX");
        assert.equal(value.data.payloadVersion, 4);
        assert.equal(value.data.readingMode, "SML_MODE");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
