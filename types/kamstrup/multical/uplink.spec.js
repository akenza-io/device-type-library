import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Kamstrup Multical Uplink", () => {
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

  let packetInfoSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/packet_info.schema.json`)
      .then((parsedSchema) => {
        packetInfoSchema = parsedSchema;
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
    it("should decode the default payload", () => {
      const data = {
        state: {},
        data: {
          "port": 2,
          "payloadHex": "15040220d7aa0d041290dfbc00022c9411023b4a1002593317025d7b130c789888698504fd1700000000"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastEnergy, 22930);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.energy, 22930);
        assert.equal(value.data.energyConsumption, 0);
        assert.equal(value.data.flow, 4.17);
        assert.equal(value.data.forwardTemperature, 59.39);
        assert.equal(value.data.power, 45000);
        assert.equal(value.data.returnTemperature, 49.87);
        assert.equal(value.data.volume, 1237.8);

        validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "packet_info");
        assert.equal(value.data.energyUnit, 'kWh');
        assert.equal(value.data.flowUnit, 'm³/h');
        assert.equal(value.data.forwardTemperatureUnit, "°C");
        assert.equal(value.data.messageFormat, "15");
        assert.equal(value.data.powerUnit, "W");
        assert.equal(value.data.returnTemperatureUnit, "°C");
        assert.equal(value.data.volumeUnit, "m³");
        assert.equal(value.data.errorFlags, 0);
        assert.deepEqual(value.data.messageFormatInfo, ['CMi4140', 'Standard', 'Kamstrup']);
        assert.equal(value.data.meterId, 85698898);

        validateSchema(value.data, packetInfoSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
