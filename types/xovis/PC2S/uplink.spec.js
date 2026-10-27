import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Xovis Uplink", () => {
  let lineCountSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lineCountSchema = loadSchema(`${import.meta.dirname}/line_count.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Xovis Event Sensor payload", () => {
      const data = {
        data: {
          values: [
            {
              timestamp: 1632385264305,
              type: "LineCrossing",
              serial: "80:1F:12:D5:30:DC",
              direction: "forward",
              object: {
                id: 3006,
                x: 303,
                y: 275,
                height: 1748,
              },
              countItem: {
                id: 0,
                name: "Line 0",
              },
              objectType: "PERSON",
            },
            {
              timestamp: 1632385264305,
              type: "ZoneExit",
              serial: "80:1F:12:D5:30:DC",
              object: {
                id: 3006,
                x: 303,
                y: 275,
                height: 1748,
              },
              countItem: {
                id: 0,
                name: "Zone 0",
              },
              objectType: "PERSON",
            },
            {
              timestamp: 1632385264305,
              type: "LineCount",
              serial: "80:1F:12:D5:30:DC",
              direction: "forward",
              object: {
                id: 3006,
                x: 303,
                y: 275,
                height: 1748,
              },
              countItem: {
                id: 0,
                name: "Line 0",
              },
              objectType: "PERSON",
            },
            {
              timestamp: 1632385264305,
              type: "CountZoneExit",
              serial: "80:1F:12:D5:30:DC",
              object: {
                id: 3006,
                x: 303,
                y: 275,
                height: 1748,
              },
              countItem: {
                id: 0,
                name: "Zone 0",
              },
              objectType: "PERSON",
            },
            {
              timestamp: 1632385264305,
              type: "FillLevelChanged",
              serial: "80:1F:12:D5:30:DC",
              object: {
                id: 0,
                x: 0,
                y: 0,
                height: 0,
              },
              countItem: {
                id: 0,
                name: "Zone 0",
              },
              objectType: "UNKNOWN",
            },
          ],
        },
      };
      expectSample("line_count", lineCountSchema, (data) => {
        assert.equal(data.fw, 1);
        assert.equal(data.bw, 0);
      });

      consume(data);
    });

    it("should decode Xovis Event Sensor payload", () => {
      const data = {
        data: {
          "sensor-time": {
            timezone: "Europe/Zurich",
            time: "2021-09-23T10:21:06+02:00",
          },
          status: {
            code: "OK",
          },
          content: {
            element: [
              {
                "element-id": 0,
                "element-name": "Line 0",
                "sensor-type": "SINGLE_SENSOR",
                "data-type": "LINE",
                from: "2021-09-23T10:20:00+02:00",
                to: "2021-09-23T10:21:00+02:00",
                resolution: "ONE_MINUTE",
                measurement: [
                  {
                    from: "2021-09-23T10:20:00+02:00",
                    to: "2021-09-23T10:21:00+02:00",
                    value: [
                      {
                        value: 1,
                        label: "fw",
                      },
                      {
                        value: 0,
                        label: "bw",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          "sensor-info": {
            "serial-number": "80:1F:12:D5:30:DC",
            "ip-address": "192.168.0.94",
            name: "Office Entrance",
            group: "Akenza Office",
            "device-type": "PC2S - UL",
          },
        },
      };
      expectSample("line_count", lineCountSchema, (data) => {
        assert.equal(data.fw, 1);
        assert.equal(data.bw, 0);
      });

      consume(data);
    });
  });
});
