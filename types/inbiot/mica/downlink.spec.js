import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits } from "test-utils";






describe("inBiot MICA Downlink", () => {
  let downlinkSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/downlink.js`));
    downlinkSchema = loadSchema(`${import.meta.dirname}/downlink.schema.json`);
  });

  describe("consume()", () => {
    it("should encode the inBiot MICA configuration payload", () => {
      const data = {
        data: {
          ledStatus: true,
          timeToSend: 10,
          resetDevice: true
        },
      };
      
      const expectedHexPayload = "01010102010a0f0101";

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
        assert.equal(value.payloadHex, expectedHexPayload);
        assert.equal(value.port, 1);
      });

      consume(data);
    });
  });
});
