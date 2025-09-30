import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("DigitalMatter DART 3 Uplink", () => {
  let digitalSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/digital.schema.json`).then((parsedSchema) => {
      digitalSchema = parsedSchema;
      done();
    });
  });

  let gpsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
      done();
    });
  });

  let analogSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/analog.schema.json`).then((parsedSchema) => {
      analogSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the DART 3 payload", () => {
      const data = {
        data: {
          SerNo: 498002,
          IMEI: "350916069476946",
          ICCID: "89410120128709136492",
          ProdId: 91,
          FW: "91.1.1.4",
          Records: [
            {
              SeqNo: 19,
              Reason: 9,
              DateUTC: "2022-06-03 14:33:46",
              Fields: [
                {
                  GpsUTC: "2013-01-01 00:00:00",
                  Lat: 0,
                  Long: 0,
                  Alt: 0,
                  Spd: 0,
                  SpdAcc: 0,
                  Head: 0,
                  PDOP: 0,
                  PosAcc: 0,
                  GpsStat: 0,
                  FType: 0,
                },
                {
                  DIn: 0,
                  DOut: 0,
                  DevStat: 2,
                  FType: 2,
                },
                {
                  AnalogueData: {
                    1: 3797,
                    2: 0,
                    3: 2900,
                    4: 21,
                    5: 9,
                  },
                  FType: 6,
                },
              ],
            },
            {
              SeqNo: 20,
              Reason: 11,
              DateUTC: "2022-06-03 14:34:23",
              Fields: [
                {
                  GpsUTC: "2022-06-03 14:34:23",
                  Lat: 47.4141228,
                  Long: 8.5340896,
                  Alt: 493,
                  Spd: 0,
                  SpdAcc: 5,
                  Head: 0,
                  PDOP: 19,
                  PosAcc: 25,
                  GpsStat: 3,
                  FType: 0,
                },
                {
                  DIn: 0,
                  DOut: 0,
                  DevStat: 2,
                  FType: 2,
                },
                {
                  AnalogueData: {
                    1: 3788,
                    2: 0,
                    3: 2900,
                    4: 21,
                    5: 0,
                  },
                  FType: 6,
                },
              ],
            },
          ],
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.latitude, 47.4141228);
        assert.equal(value.data.longitude, 8.5340896);
        assert.equal(value.data.altitude, 493);
        assert.equal(value.data.gpsAccuracy, 25);
        assert.equal(value.data.heading, 0);
        assert.equal(value.data.speed, 0);
        assert.equal(value.data.speedAccuracy, 5);
        assert.equal(value.data.pdop, 19);

        validateSchema(value.data, gpsSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital");
        assert.equal(value.data.devStat, 2);
        assert.equal(value.data.digitalIn, 0);
        assert.equal(value.data.digitalOut, 0);

        validateSchema(value.data, digitalSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "analog");
        assert.equal(value.data.analog["1"], 3788);
        assert.equal(value.data.analog["2"], 0);
        assert.equal(value.data.analog["3"], 2900);
        assert.equal(value.data.analog["4"], 21);
        assert.equal(value.data.analog["5"], 0);

        validateSchema(value.data, analogSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
