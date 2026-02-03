import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Episensor Uplink", () => {
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

  let errorSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/error.schema.json`)
      .then((parsedSchema) => {
        errorSchema = parsedSchema;
        done();
      });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.totalActivePowerKWh, 12970);
        assert.equal(value.data.incrementActivePowerKWh, 0);

        validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.totalActivePowerKWh, 12974);
        assert.equal(value.data.incrementActivePowerKWh, 4);

        validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.totalActivePowerKWh, 12988.3);
        assert.equal(value.data.incrementActivePowerKWh, 14.3);

        validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.totalActivePowerKWh, 13000);
        assert.equal(value.data.incrementActivePowerKWh, 11.7);

        validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.id, "000D6F001911015F_333");
        assert.equal(value.lastTotalActivePowerKWh, 13000);
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "error");
        assert.equal(value.data.error, "Device connected to bridge changed. If it's a new counter please add it as a new device.");
        assert.equal(value.data.value, 255.3);
        assert.equal(value.data.newId, "000D6F001911015F_444");
        assert.equal(value.data.initialId, "000D6F001911015F_333");
        assert.equal(value.data.period, "2026-02-03T09:15:00");

        validateSchema(value.data, errorSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.id, "000D6F001911015F_333");
        assert.equal(value.lastTotalActivePowerKWh, 13000);
      });

      consume(data);
    });
  });
});
