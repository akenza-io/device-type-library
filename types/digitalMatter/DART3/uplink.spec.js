const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("DigitalMatter DART 3 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.latitude, 47.4141228);
        assert.equal(value.data.longitude, 8.5340896);
        assert.equal(value.data.altitude, 493);
        assert.equal(value.data.gpsAccuracy, 25);
        assert.equal(value.data.heading, 0);
        assert.equal(value.data.speed, 0);
        assert.equal(value.data.speedAccuracy, 5);
        assert.equal(value.data.pdop, 19);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
