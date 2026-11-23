import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("EMU Professional Uplink", () => {
  let defaultSchema = null;
  let systemSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        return loadSchema(`${__dirname}/system.schema.json`);
      })
      .then((parsedSchema) => {
        systemSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the startup payload", () => {
      const data = {
        state: {},
        data: {
          "port": 1,
          "payloadHex": "0c2bf46a038f270200040000000005000000000600000000f00055"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.ctRatioChange, false);
        assert.equal(value.data.impulseRatioChange, false);
        assert.equal(value.data.impulseWidthChange, false);
        assert.equal(value.data.logbookFull, false);
        assert.equal(value.data.powerFail, false);
        assert.equal(value.data.timeChanged, false);
        assert.equal(value.data.vtRatioChange, false);
        assert.equal(value.data.value, 0);

        validateSchema(value.data, systemSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.activeEnergyExportT1, 0);
        assert.equal(value.data.activeEnergyExportT2, 0);
        assert.equal(value.data.activeEnergyExportT1Consumption, 0);
        assert.equal(value.data.activeEnergyExportT2Consumption, 0);
        assert.equal(value.data.activeEnergyImportT1, 141.199);
        assert.equal(value.data.activeEnergyImportT2, 0);
        assert.equal(value.data.activeEnergyImportT1Consumption, 0);
        assert.equal(value.data.activeEnergyImportT2Consumption, 0);

        validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.activeEnergyImportT1, 141.199);
        assert.equal(value.activeEnergyImportT2, 0);
      });
      consume(data);
    });
  });
});
