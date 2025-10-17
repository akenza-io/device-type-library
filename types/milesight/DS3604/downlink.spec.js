

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("DS3604 Downlink", () => {
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/downlink.js`);
    consume = init(script);
    done();
  });

  describe("consume()", () => {
    it("should pass the raw DS3604 downlink", () => {
      const data = {
        "payload": {
          "payloadHex": "18",
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.payloadHex, "18");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 85);
      });

      consume(data);
    });

    it("should encode a report interval payload", () => {
      const data = {
        payload: { "actionType": "reportInterval", "reportInterval": 1600 }
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.payloadHex, "FF4006");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 85);
      });

      consume(data);
    });

    it("should encode a content update payload and change the template", () => {
      const data = {
        payload: {
          "actionType": "multiDownlink",
          "multiDownlink": [
            {
              "actionType": "contentUpdate",
              "template": 2,
              "moduleId": 5,
              "content": "Guest Waiting"
            },
            {
              "actionType": "displayTemplate",
              "mode": "TEMPLATE_1",
            }
          ]
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.payloadHex, "FB01440d47756573742057616974696e67FF3D02FF7300");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 85);
      });

      consume(data);
    });
  });
});
