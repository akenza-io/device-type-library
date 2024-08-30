const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("ACRIOS Systems ACR-CV-101L-M-X Uplink", () => {
    let consume = null;
    before((done) => {
        const script = rewire("./uplink.js");
        consume = utils.init(script);
        done();
    });

    describe("consume()", () => {
        it("should decode the ACR-CV-101L-M-X payload", () => {
            const data = {
                data: {
                    port: 1,
                    payloadHex: "010168131368080573785634120a00e97e01000000350100003c16",
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "state");
                assert.isNotNull(value);
                assert.isObject(value);
                
                assert.equal(value.lastFrameIndex, 0);
                assert.deepEqual(value.previousPayloads, []);
            });

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "mbus");
                assert.deepEqual(value.data, {"len":25,"type":"Data","l":19,"c":8,"a":5,"ci":115,"errors":[],"fixed":true,"id":12345678,"accessN":10,"status":0,"cStored":"Actual","deviceCode":7,"deviceType":"Water meter","data":[{"id":0,"storage":0,"func":"Instantaneous","value":1,"unit":"l"},{"id":1,"storage":1,"func":"Instantaneous","value":135,"unit":"l"}]});
            });
            consume(data);
        });        
    });
});
