const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Axis People Counter Uplink", () => {
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
    it("should decode the Axis People Counter event payload", () => {
      const data = {
        data: {
          "apiName": "Axis Retail Data",
          "apiVersion": "0.4",
          "utcSent": "2025-05-22T08:15:38Z",
          "localSent": "2025-05-22T10:15:38",
          "data": {
            "utcFrom": "2025-05-22T08:14:00Z",
            "utcTo": "2025-05-22T08:15:00Z",
            "localFrom": "2025-05-22T10:14:00",
            "localTo": "2025-05-22T10:15:00",
            "measurements": [
              {
                "kind": "people-counts",
                "utcFrom": "2025-05-22T08:14:00Z",
                "utcTo": "2025-05-22T08:15:00Z",
                "localFrom": "2025-05-22T10:14:00",
                "localTo": "2025-05-22T10:15:00",
                "items": [
                  {
                    "direction": "in",
                    "count": 1,
                    "adults": 0
                  },
                  {
                    "direction": "out",
                    "count": 2,
                    "adults": 0
                  }
                ]
              }
            ]
          },
          "sensor": {
            "application": "AXIS 3D People Counter",
            "applicationVersion": "11.11.148",
            "timeZone": "Europe/Zurich",
            "name": "axis-b8a44fa89c85",
            "serial": "b8a44fa89c85",
            "ipAddress": "192.168.109.60"
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "line_count");
        assert.equal(value.data.fw, 1);
        assert.equal(value.data.bw, 2);

        utils.validateSchema(value.data, lineCountSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
