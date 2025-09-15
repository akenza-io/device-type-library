const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Milesight CT103 Uplink", () => {
    let defaultSchema = null;
    let alarmSchema = null;
    let systemSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire("./uplink.js");
        consume = utils.init(script);
        [defaultSchema, alarmSchema, systemSchema] = await Promise.all([
            utils.loadSchema(`${__dirname}/default.schema.json`),
            utils.loadSchema(`${__dirname}/alarm.schema.json`),
            utils.loadSchema(`${__dirname}/system.schema.json`),
        ]);
    });

    describe("consume()", () => {
        it("should decode the basic information payload from the factsheet", () => {
            const data = {
                data: {
                    payloadHex:
                        "ff0bffff0101ffff0101ff166746d48016300014ff090110ff0a0101ff0f00",
                    port: 85,
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "system");
                assert.equal(value.data.protocolVersion, "V1");
                assert.equal(value.data.hardwareVersion, "v1.1");
                assert.equal(value.data.softwareVersion, "v1.1");
                assert.equal(value.data.tslVersion, "v1.1");
                assert.equal(value.data.sn, "6746d48016300014");
                assert.equal(value.data.lorawanClass, "CLASS_A");
                assert.equal(value.data.deviceStatus, "on");
                utils.validateSchema(value.data, systemSchema, { throwError: true });
            });

            consume(data);
        });

        it("should decode the periodic sensor data payload from the factsheet", () => {
            const data = {
                data: {
                    payloadHex: "0397730200000498001909673401",
                    port: 85,
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "default");
                assert.equal(value.data.totalCurrent, 6.27);
                assert.equal(value.data.current, 64);
                assert.equal(value.data.temperature, 30.8);
                utils.validateSchema(value.data, defaultSchema, { throwError: true });
            });

            consume(data);
        });

        it("should decode the current alarm payload from the factsheet", () => {
            const data = {
                data: {
                    payloadHex: "8498b80bd007c40901",
                    port: 85,
                },
            };

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "alarm");
                assert.equal(value.data.currentMax, 30);
                assert.equal(value.data.currentMin, 20);
                assert.equal(value.data.currentAlarmStatus, "CURRENT_THRESHOLD_ALARM");
                utils.validateSchema(value.data, alarmSchema, { throwError: true });
            });

            consume(data);
        });
    });
});