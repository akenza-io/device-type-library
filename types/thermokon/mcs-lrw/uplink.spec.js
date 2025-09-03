// test script for uplink.js decoder
const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Thermokon MCS-LRW Uplink", () => {
    let defaultSchema = null;
    let lifecycleSchema = null;
    let statusSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire("./uplink.js");
        consume = utils.init(script);
        [defaultSchema, lifecycleSchema, statusSchema] = await Promise.all([
            utils.loadSchema(`${__dirname}/default.schema.json`),
            utils.loadSchema(`${__dirname}/lifecycle.schema.json`),
            utils.loadSchema(`${__dirname}/status.schema.json`),
        ]);
    });


    describe("consume()", () => {

        it("should decode the Thermokon MCS-LRW uplink", () => {
            const data = {
                data: {
                    payloadHex: "c00040014100",
                    port: 2,
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "default");
                assert.equal(value.data.occupied, false);
                assert.equal(value.data.motionCount, 0);

                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });


            // status test
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");


                assert.equal(value.topic, "status");
                assert.equal(value.data.deviceKey, 16385);

                utils.validateSchema(value.data, statusSchema, { throwError: true });
            });


            consume(data);
        });
        it("should decode the Thermokon MCS-LRW uplink", () => {
            const data = {
                data: {
                    payloadHex: "54481000fc112d400000",
                    port: 2,
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "default");
                assert.equal(value.data.temperature, 25.5);
                assert.equal(value.data.humidity, 45);
                assert.equal(value.data.light, 0);


                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "lifecycle");
                assert.equal(value.data.batteryVoltage, 1.44);

                utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
            });


        });

        it("should decode the Thermokon MCS-LRW uplink", () => {
            const data = {
                data: {
                    payloadHex: "10010a",
                    port: 2,
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "default");
                assert.equal(value.data.temperature, 26.5);

                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
        });

        it("should decode the Thermokon MCS-LRW uplink", () => {
            const data = {
                data: {
                    payloadHex: "4112",
                    port: 2,
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.isNotNull(value);
                assert.typeOf(value.data, "object");

                assert.equal(value.topic, "default");
                assert.equal(value.data.occupied, false);
                assert.equal(value.data.motionCount, 9);

                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });
        });

    });
});