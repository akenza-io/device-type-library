
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Milesight CT103 Uplink", () => {
    let defaultSchema = null;
    let alarmSchema = null;
    let systemSchema = null;
    let consume = null;

    before(() => {
      consume = init(rewire(`${import.meta.dirname}/uplink.js`));
      defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
      alarmSchema = loadSchema(`${import.meta.dirname}/alarm.schema.json`);
      systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
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

            expectSample("system", systemSchema, (data) => {
                assert.equal(data.protocolVersion, "V1");
                assert.equal(data.hardwareVersion, "v1.1");
                assert.equal(data.softwareVersion, "v1.1");
                assert.equal(data.tslVersion, "v1.1");
                assert.equal(data.sn, "6746d48016300014");
                assert.equal(data.lorawanClass, "CLASS_A");
                assert.equal(data.deviceStatus, "on");
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

            expectSample("default", defaultSchema, (data) => {
                assert.equal(data.totalCurrent, 6.27);
                assert.equal(data.current, 64);
                assert.equal(data.temperature, 30.8);
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

            expectSample("alarm", alarmSchema, (data) => {
                assert.equal(data.currentMax, 30);
                assert.equal(data.currentMin, 20);
                assert.equal(data.currentAlarmStatus, "CURRENT_THRESHOLD_ALARM");
            });

            consume(data);
        });
    });
});