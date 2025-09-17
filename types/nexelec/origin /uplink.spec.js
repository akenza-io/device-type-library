// IMPORTANT NOTE: The sample payloads used in this tests suite are fabricated and do not represent real device data. 
const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Nexelec Origin uplink", () => {
    let systemSchema = null;
    let lifecycleSchema = null;
    let alarmSchema = null;
    let defaultSchema = null;
    let datalogSchema = null;
    let consume = null;

    before(async () => {
        const script = rewire("./uplink.js");
        consume = utils.init(script);

        [systemSchema, lifecycleSchema, alarmSchema, defaultSchema, datalogSchema] = await Promise.all([
            utils.loadSchema(`${__dirname}/system.schema.json`),
            utils.loadSchema(`${__dirname}/lifecycle.schema.json`),
            utils.loadSchema(`${__dirname}/alarm.schema.json`),
            utils.loadSchema(`${__dirname}/default.schema.json`),
            utils.loadSchema(`${__dirname}/datalog.schema.json`),
        ])

    });


    describe("consume()", () => {
        it("decodes Product Status (type 0x00)", () => {
            const data = {
                data: {
                    port: 56,
                    payloadHex: "B200011E7805C8",
                },
            };

            // system
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "system");
                assert.isObject(value.data);
                assert.equal(value.data.productType, "ORIGIN");
                assert.equal(value.data.hardwareVersion, 1);
                assert.equal(value.data.softwareVersion, "3.0");
                assert.equal(value.data.magneticBaseDetection, "Magnetic base detected");

                utils.validateSchema(value.data, systemSchema, { throwError: true });
            });

            // lifecycle
            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "lifecycle");
                assert.isObject(value.data);
                assert.equal(value.data.remainingProductLife, 120);
                assert.equal(value.data.smokeSensorStatus, "OK");
                assert.equal(value.data.tempHumSensorStatus, "OK");
                assert.equal(value.data.batteryLevel, "MEDIUM");
                assert.equal(value.data.batteryVoltage, 3000);

                utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
            });

            consume(data);
        });

        it("decodes system and datalog", () => {
            const data = {
                data: {
                    port: 56,
                    payloadHex: "B201262048C33039020064",
                }
            }

            utils.expectEmits((type, value) => {
                assert.equal(type, "sample");
                assert.equal(value.topic, "system");
                assert.isObject(value.data)
                assert.equal(value.data.productType, "ORIGIN")
                assert.equal(value.data.reconfigurationSource, "DOWNLINK")
                assert.equal(value.data.reconfigurationStatus, "TOTAL_SUCCESS")
                assert.equal(value.data.delayedJoinRequest, false)
                assert.equal(value.data.nfcStatus, "NON_DISCOVERABLE")
                assert.equal(value.data.d2dNetworkId, 12345)
                assert.equal(value.data.timeZone, "UTC+2")
                assert.equal(value.data.downlinkFcnt, 100)

                utils.validateSchema(value.data, systemSchema, { throwError: true });
            })
        })


    });
});
