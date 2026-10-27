import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("DigitalMatter DART 3 Uplink", () => {
  let digitalSchema = null;
  let consume = null;
  let gpsSchema = null;
  let analogSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    digitalSchema = loadSchema(`${import.meta.dirname}/digital.schema.json`);
    gpsSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
    analogSchema = loadSchema(`${import.meta.dirname}/analog.schema.json`);
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

      expectSample("gps", gpsSchema, (data) => {
        assert.equal(data.latitude, 47.4141228);
        assert.equal(data.longitude, 8.5340896);
        assert.equal(data.altitude, 493);
        assert.equal(data.gpsAccuracy, 25);
        assert.equal(data.heading, 0);
        assert.equal(data.speed, 0);
        assert.equal(data.speedAccuracy, 5);
        assert.equal(data.pdop, 19);
      });

      expectSample("digital", digitalSchema, (data) => {
        assert.equal(data.devStat, 2);
        assert.equal(data.digitalIn, 0);
        assert.equal(data.digitalOut, 0);
      });

      expectSample("analog", analogSchema, (data) => {
        assert.equal(data.analog["1"], 3788);
        assert.equal(data.analog["2"], 0);
        assert.equal(data.analog["3"], 2900);
        assert.equal(data.analog["4"], 21);
        assert.equal(data.analog["5"], 0);
      });

      consume(data);
    });
  });
});
