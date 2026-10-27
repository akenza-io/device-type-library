// test script for uplink.js decoderimport { assert } from "chai";
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino S31LB-LS Uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let consume = null;

    before(() => {
      consume = init(rewire(`${import.meta.dirname}/uplink.js`));
      defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
      lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    });


    describe("consume()", () => {

        // port 2
        it("should decode the Dragino S31LB-LS on port 2", () => {
            const data = {
                data: {
                    port: 2,
                    payloadHex: "0e1c68a2ef9b0001130191",
                },
            };

            expectSample("default", defaultSchema, (data) => {
                assert.equal(data.alarmFlag, false);
                assert.equal(data.pa8, "High");
                assert.equal(data.temperature, 27.5);
                assert.equal(data.humidity, 40.1);
                assert.equal(data.modStatus, 1);
            });

            // lifecycle test
            expectSample("lifecycle", lifecycleSchema, (data) => {
                assert.equal(data.batteryVoltage, 3.612);
                assert.equal(data.batteryLevel, 75);
            });

            consume(data);
        });

        // todo: test for port 3 and 5 
    });
});