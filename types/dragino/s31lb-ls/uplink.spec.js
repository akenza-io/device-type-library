// test script for uplink.js decoder
const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");
const { assert } = chai;

describe("Dragino S31LB-LS Uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire("./uplink.js");
        consume = utils.init(script);
        [defaultSchema, lifecycleSchema] = await Promise.all([
            utils.loadSchema(`${__dirname}/default.schema.json`),
            utils.loadSchema(`${__dirname}/lifecycle.schema.json`),
        ]);
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

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "default");
                assert.equal(value.data.alarmFlag, false);
                assert.equal(value.data.pa8, "High");
                assert.equal(value.data.temperature, 27.5);
                assert.equal(value.data.humidity, 40.1);
                assert.equal(value.data.modStatus, 1);
                assert.equal(value.data.pollMessage, null);

                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });

            // lifecycle test
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "lifecycle");
                assert.equal(value.data.batteryVoltage, 3.612);
                assert.equal(value.data.batteryLevel, 75);
                utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
            });

            consume(data);
        });





        // todo: test for port 3 and 5 
    });
});