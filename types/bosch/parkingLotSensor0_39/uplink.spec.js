

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Bosch Parking Lot Sensor Uplink", () => {
  let occupancySchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  let startUpSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/start_up.schema.json`)
      .then((parsedSchema) => {
        startUpSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Bosch Parking Lot Sensor payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastOccupiedValue, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 0);
        assert.equal(value.data.occupied, false);

        validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Bosch Parking Lot Sensor payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "01",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastOccupiedValue, true);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 1);
        assert.equal(value.data.occupied, true);

        validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Bosch Parking Lot Sensor start_up payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "0a000000970320cd000200000027020300",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "start_up");
        assert.equal(value.data.debug, "0A000000970320CD0002");
        assert.equal(value.data.fwVersion, "0.39.2");
        assert.equal(value.data.resetCause, "SYSTEM_REQUEST_RESET");

        validateSchema(value.data, startUpSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
