const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Xovis Uplink", () => {
  let lineCountSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/line_count.schema.json`)
      .then((parsedSchema) => {
        lineCountSchema = parsedSchema;
        done();
      });
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
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 1);
        assert.equal(value.data.bw, 0);

        utils.validateSchema(value.data, lineCountSchema, { throwError: true });
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
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 1);
        assert.equal(value.data.bw, 0);

        utils.validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
