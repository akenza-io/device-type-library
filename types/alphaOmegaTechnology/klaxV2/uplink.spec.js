
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Aplha Omega Technologoy KlaxV2 Uplink", () => {
  let register1Schema = null;
  let register2Schema = null;
  let register3Schema = null;
  let register4Schema = null;
  let lifecycleSchema = null;
  let registerSearchSchema = null;
  let registerSetSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    register1Schema = loadSchema(`${import.meta.dirname}/register_1.schema.json`);
    register2Schema = loadSchema(`${import.meta.dirname}/register_2.schema.json`);
    register3Schema = loadSchema(`${import.meta.dirname}/register_3.schema.json`);
    register4Schema = loadSchema(`${import.meta.dirname}/register_4.schema.json`);
    registerSearchSchema = loadSchema(`${import.meta.dirname}/register_search.schema.json`);
    registerSetSchema = loadSchema(`${import.meta.dirname}/register_set.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
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

      expectSample("register_1", register1Schema, (data) => {
        assert.equal(data.filterPositionActive, true);
        assert.equal(data.filterPositionUnit, "Wh");

        assert.equal(data.dataPointValid, true);
        assert.equal(data.dataPoint1Valid, true);
        assert.equal(data.dataPoint2Valid, true);
        assert.equal(data.dataPoint3Valid, true);

        assert.equal(data.dataPoint, 21000);
        assert.equal(data.dataPoint1, 21000);
        assert.equal(data.dataPoint2, 21000);
        assert.equal(data.dataPoint3, 21000);
      });

      expectSample("register_2", register2Schema, (data) => {
        assert.equal(data.filterPositionActive, true);
        assert.equal(data.filterPositionUnit, "Wh");

        assert.equal(data.dataPointValid, true);
        assert.equal(data.dataPoint1Valid, true);
        assert.equal(data.dataPoint2Valid, true);
        assert.equal(data.dataPoint3Valid, true);

        assert.equal(data.dataPoint, 21000);
        assert.equal(data.dataPoint1, 21000);
        assert.equal(data.dataPoint2, 21000);
        assert.equal(data.dataPoint3, 21000);
      });

      expectSample("register_3", register3Schema, (data) => {
        assert.equal(data.filterPositionActive, true);
        assert.equal(data.filterPositionUnit, "Wh");

        assert.equal(data.dataPointValid, true);
        assert.equal(data.dataPoint1Valid, true);
        assert.equal(data.dataPoint2Valid, true);
        assert.equal(data.dataPoint3Valid, true);

        assert.equal(data.dataPoint, 21000);
        assert.equal(data.dataPoint1, 21000);
        assert.equal(data.dataPoint2, 21000);
        assert.equal(data.dataPoint3, 21000);
      });

      expectSample("register_4", register4Schema, (data) => {
        assert.equal(data.filterPositionActive, true);
        assert.equal(data.filterPositionUnit, "Wh");

        assert.equal(data.dataPointValid, true);
        assert.equal(data.dataPoint1Valid, true);
        assert.equal(data.dataPoint2Valid, true);
        assert.equal(data.dataPoint3Valid, true);

        assert.equal(data.dataPoint, 21000);
        assert.equal(data.dataPoint1, 21000);
        assert.equal(data.dataPoint2, 21000);
        assert.equal(data.dataPoint3, 21000);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.connectionTest, false);
        assert.equal(data.registersConfigured, true);
        assert.equal(data.deviceType, "SML_KLAX");
        assert.equal(data.payloadVersion, 4);
        assert.equal(data.readingMode, "SML_MODE");
        assert.equal(data.serverID, "0A014C475A00028131F7");
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

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.connectionTest, false);
        assert.equal(data.registersConfigured, true);
        assert.equal(data.deviceType, "SML_KLAX");
        assert.equal(data.payloadVersion, 4);
        assert.equal(data.readingMode, "SML_MODE");
        assert.equal(data.measurementInterval, 15);
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

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.connectionTest, false);
        assert.equal(data.registersConfigured, true);
        assert.equal(data.deviceType, "SML_KLAX");
        assert.equal(data.payloadVersion, 4);
        assert.equal(data.readingMode, "SML_MODE");
        assert.equal(data.appVersion, "1.3");
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

      expectSample("register_search", registerSearchSchema, (data) => {
        assert.equal(data.register1ID, "1.8.0");
        assert.equal(data.register2ID, "1.8.2");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.connectionTest, false);
        assert.equal(data.registersConfigured, true);
        assert.equal(data.deviceType, "SML_KLAX");
        assert.equal(data.payloadVersion, 4);
        assert.equal(data.readingMode, "SML_MODE");
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

      expectSample("register_set", registerSetSchema, (data) => {
        assert.equal(data.registerFilter1Set, true);
        assert.equal(data.registerFilter2Set, true);
        assert.equal(data.registerFilter3Set, false);
        assert.equal(data.registerFilter4Set, false);

        assert.equal(data.registerFilter1ID, "1.8.0");
        assert.equal(data.registerFilter2ID, "2.8.0");
        assert.equal(data.registerFilter3ID, "0.0.0");
        assert.equal(data.registerFilter4ID, "0.0.0");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.connectionTest, false);
        assert.equal(data.registersConfigured, true);
        assert.equal(data.deviceType, "SML_KLAX");
        assert.equal(data.payloadVersion, 4);
        assert.equal(data.readingMode, "SML_MODE");
      });
      consume(data);
    });
  });
});
