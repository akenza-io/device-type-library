import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("DS3604 Uplink", () => {
  let templateSchema = null;
  let lifecycleSchema = null;
  let buttonSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    templateSchema = loadSchema(`${import.meta.dirname}/template.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    buttonSchema = loadSchema(`${import.meta.dirname}/button.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the DS3604 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "017564FB0100054D696C6573FB010A0568656C6C6F",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("template", templateSchema, (data) => {
        assert.equal(data.qrCode, "hello");
        assert.equal(data.templateId, 1);
        assert.equal(data.text1, "Miles");
      });

      consume(data);
    });

    it("should decode should decode the DS3604 button payload", () => {
      const data = {
        data: {
          "payloadHex": "ff2e00ff7301ff2e00ff7301ff2e00ff7301",
          "port": 85
        },
      };

      expectSample("template", templateSchema, (data) => {
        assert.equal(data.templateId, 2);
      });

      expectSample("button", buttonSchema, (data) => {
        assert.equal(data.button, "SINGLE_CLICK");
        assert.equal(data.numericButton, 1);
      });

      consume(data);
    });
  });
});
