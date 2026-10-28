import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Episensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let errorSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    errorSchema = loadSchema(`${import.meta.dirname}/error.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Episensor payload", () => {
      const data = {
        state: {},
        data: {
          "ver": "1.0",
          "method": "epi_data",
          "data": [
            {
              "id": "000D6F001911015F_333",
              "period": "2026-02-03T15:15:00",
              "value": 13000
            },
            {
              "id": "000D6F001911015F_333",
              "period": "2026-02-02T09:15:00",
              "value": 12970
            },
            {
              "id": "000D6F001911015F_333",
              "period": "2026-02-03T09:00:00",
              "value": 12974
            },
            {
              "id": "000D6F001911015F_333",
              "period": "2026-02-03T09:15:00",
              "value": 12988.3
            }
          ],
          "gateway": "000D6F00190BE42F"
        }
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.totalActivePowerKWh, 12970);
        assert.equal(data.incrementActivePowerKWh, 0);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.totalActivePowerKWh, 12974);
        assert.equal(data.incrementActivePowerKWh, 4);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.totalActivePowerKWh, 12988.3);
        assert.equal(data.incrementActivePowerKWh, 14.3);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.totalActivePowerKWh, 13000);
        assert.equal(data.incrementActivePowerKWh, 11.7);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.id, "000D6F001911015F_333");
        assert.equal(value.lastTotalActivePowerKWh, 13000);
        assert.equal(value.lastPeriod, new Date("2026-02-03T15:15:00").getTime());
      });
      consume(data);
    });


    it("should emit an error sample as the id has changed", () => {
      const data = {
        state: {
          id: "000D6F001911015F_333",
          lastTotalActivePowerKWh: 13000
        },
        data: {
          "ver": "1.0",
          "method": "epi_data",
          "data": [
            {
              "id": "000D6F001911015F_444",
              "period": "2026-02-03T09:15:00",
              "value": 255.3
            }
          ],
          "gateway": "000D6F00190BE42F"
        }
      };

      expectSample("error", errorSchema, (data) => {
        assert.equal(data.error, "Device connected to bridge changed. If it's a new counter please add it as a new device.");
        assert.equal(data.value, 255.3);
        assert.equal(data.newId, "000D6F001911015F_444");
        assert.equal(data.initialId, "000D6F001911015F_333");
        assert.deepEqual(data.period, new Date("2026-02-03T09:15:00").toISOString());
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.id, "000D6F001911015F_333");
        assert.equal(value.lastTotalActivePowerKWh, 13000);
      });

      consume(data);
    });

    it("should decode the Episensor payload and discard all backfilled data", () => {
      const data = {
        state: { id: "000D6F001911015F_333", lastTotalActivePowerKWh: 13000, lastPeriod: 1770128100000 },
        data: {
          "ver": "1.0",
          "method": "epi_data",
          "data": [
            {
              "id": "000D6F001911015F_333",
              "period": "2026-02-04T15:15:00",
              "value": 14000
            },
            {
              "id": "000D6F001911015F_333",
              "period": "2026-02-01T09:15:00",
              "value": 12970
            },
            {
              "id": "000D6F001911015F_333",
              "period": "2026-02-03T09:00:00",
              "value": 12974
            },
            {
              "id": "000D6F001911015F_333",
              "period": "2026-02-03T09:15:00",
              "value": 12988.3
            }
          ],
          "gateway": "000D6F00190BE42F"
        }
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.totalActivePowerKWh, 14000);
        assert.equal(data.incrementActivePowerKWh, 1000);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.id, "000D6F001911015F_333");
        assert.equal(value.lastTotalActivePowerKWh, 14000);
        assert.equal(value.lastPeriod, new Date("2026-02-04T15:15:00").getTime());
      });
      consume(data);
    });
  });
});
