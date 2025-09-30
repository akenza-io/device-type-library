import { assert } from "chai";
import rewire from "rewire";
import { init, expectEmits } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("ACRIOS Systems ACR-CV-101L-M-X Uplink", () => {
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    done();
  });

  describe("consume()", () => {
    it("should decode the ACR-CV-101L-M-X payload", () => {
      const data = {
        data: {
          port: 100,
          payloadHex: "010168131368080573785634120a00e97e01000000350100003c16",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.isObject(value);

        assert.equal(value.lastFrameIndex, 0);
        assert.deepEqual(value.previousPayloads, []);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "mbus");
        assert.equal(value.data.len, 25);
        assert.equal(value.data.type, "Data");
        assert.equal(value.data.l, 19);
        assert.equal(value.data.c, 8);
        assert.equal(value.data.a, 5);
        assert.equal(value.data.ci, 115);
        assert.deepEqual(value.data.errors, []);
        assert.equal(value.data.fixed, true);
        assert.equal(value.data.id, 12345678);
        assert.equal(value.data.accessN, 10);
        assert.equal(value.data.status, 0);
        assert.equal(value.data.cStored, "Actual");
        assert.equal(value.data.deviceCode, 7);
        assert.equal(value.data.deviceType, "Water meter");
        assert.deepEqual(value.data.data, [
          { id: 0, storage: 0, func: "Instantaneous", value: 1, unit: "l" },
          { id: 1, storage: 1, func: "Instantaneous", value: 135, unit: "l" },
        ]);

        assert.equal(value.data.data0Unit, "l");
        assert.equal(value.data.data0Value, 1);
        assert.equal(value.data.data0Func, "Instantaneous");
        assert.equal(value.data.data0Storage, 0);
        assert.equal(value.data.data1Unit, "l");
        assert.equal(value.data.data1Value, 135);
        assert.equal(value.data.data1Func, "Instantaneous");
        assert.equal(value.data.data1Storage, 1);
      });

      consume(data);
    });
  });
});
