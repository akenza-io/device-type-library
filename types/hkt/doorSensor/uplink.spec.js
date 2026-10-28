import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Should decode the HKT Door Sensor uplinks", () => {
  let doorSchema = null;
  let consume = null;
  let systemSchema = null;
  let defaultSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    doorSchema = loadSchema(`${import.meta.dirname}/door.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("Should decode the HKT Door Sensor Version uplinks", () => {
      const data = {
        data: {
          payloadHex: "686b740001010202036408002202230800100024001e25008400",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.open, false);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.countingHours, "8:0-16:0");
        assert.equal(data.countingInterval, 30);
        assert.equal(data.hwVersion, 2);
        assert.equal(data.swVersion, 2);
        assert.equal(data.installed, true);
        assert.equal(data.lifecycleInterval, 24);
        assert.equal(data.mode, 2);
      });

      consume(data);
    });

    it("Should decode the HKT Door Sensor openings uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B74000726000C000C000001F4000001F4",
        },
      };

      expectSample("door", doorSchema, (data) => {
        assert.equal(data.nrClosings, 12);
        assert.equal(data.nrOpenings, 12);

        assert.equal(data.absClosings, 500);
        assert.equal(data.absOpenings, 500);
      });

      consume(data);
    });
  });
});
