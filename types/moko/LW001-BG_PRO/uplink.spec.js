const decoder = require('./uplink'); // 导入你的 decoder 脚本

describe('Decoder Tests', () => {
    // 测试 Heartbeat 消息
    it('should decode Heartbeat payload correctly', () => {
        const event = {
            data: {
                port: 1, // Heartbeat 的 port
                payloadHex: '010203040506' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            port: 1,
            hexFormatPayload: "010203040506",
            payloadType: "Heartbeat",
            operationMode: "Standby mode",
            temperature: "3°C",
            ack: 3,
            batteryVoltage: "2.5V",
            rebootReason: "Restart after power failure",
            firmwareVersion: "V0.0.3",
            activityCount: 1286
        });
    });

    // 测试 Location Fixed 消息
    it('should decode Location Fixed payload correctly', () => {
        const event = {
            data: {
                port: 2, // Location Fixed 的 port
                payloadHex: '02030405060708' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            port: 2,
            hexFormatPayload: "02030405060708",
            payloadType: "Location Fixed",
            operationMode: "Periodic mode",
            temperature: "3°C",
            ack: 3,
            batteryVoltage: "2.5V",
            positionSuccessType: "WIFI positioning success",
            timestamp: "2023-10-15 12:34:56 TZ:8",
            macData: [
                { mac: "0x020x030x040x050x060x07", rssi: "-249dBm" }
            ]
        });
    });

    // 测试 Location Failure 消息
    it('should decode Location Failure payload correctly', () => {
        const event = {
            data: {
                port: 3, // Location Failure 的 port
                payloadHex: '03040506070809' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            port: 3,
            hexFormatPayload: "03040506070809",
            payloadType: "Location Failure",
            operationMode: "Timing mode",
            temperature: "4°C",
            ack: 4,
            batteryVoltage: "2.6V",
            reasonsForPositioningFailure: "WIFI positioning time is not enough (The location payload reporting interval is set too short, please increase the report interval of the current working mode via MKLoRa app)",
            macData: [
                { mac: "0x030x040x050x060x070x08", rssi: "-248dBm" }
            ],
            pdop: 1.2,
            gpsSatelliteCn: "1-2-3-4"
        });
    });

    // 测试 Shutdown 消息
    it('should decode Shutdown payload correctly', () => {
        const event = {
            data: {
                port: 4, // Shutdown 的 port
                payloadHex: '0405060708090A' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            port: 4,
            hexFormatPayload: "0405060708090A",
            payloadType: "Shutdown",
            operationMode: "Motion mode",
            temperature: "5°C",
            ack: 5,
            batteryVoltage: "2.7V",
            shutdownType: "Bluetooth command to turn off the device"
        });
    });

    // 测试 Vibration 消息
    it('should decode Vibration payload correctly', () => {
        const event = {
            data: {
                port: 5, // Vibration 的 port
                payloadHex: '05060708090A0B' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            port: 5,
            hexFormatPayload: "05060708090A0B",
            payloadType: "Shock",
            operationMode: "Standby mode",
            temperature: "6°C",
            ack: 6,
            batteryVoltage: "2.8V",
            numberOfShocks: 1234
        });
    });

    // 测试 Man Down 消息
    it('should decode Man Down payload correctly', () => {
        const event = {
            data: {
                port: 6, // Man Down 的 port
                payloadHex: '060708090A0B0C' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            port: 6,
            hexFormatPayload: "060708090A0B0C",
            payloadType: "Man Down detection",
            operationMode: "Periodic mode",
            temperature: "7°C",
            ack: 7,
            batteryVoltage: "2.9V",
            totalIdleTime: 5678
        });
    });

    // 测试 Tamper 消息
    it('should decode Tamper payload correctly', () => {
        const event = {
            data: {
                port: 7, // Tamper 的 port
                payloadHex: '0708090A0B0C0D' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            port: 7,
            hexFormatPayload: "0708090A0B0C0D",
            payloadType: "Tamper Alarm",
            operationMode: "Timing mode",
            temperature: "8°C",
            ack: 8,
            batteryVoltage: "3.0V",
            timestamp: "2023-10-15 12:34:56 TZ:8"
        });
    });

    // 测试 Event 消息
    it('should decode Event payload correctly', () => {
        const event = {
            data: {
                port: 8, // Event 的 port
                payloadHex: '08090A0B0C0D0E' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            port: 8,
            hexFormatPayload: "08090A0B0C0D0E",
            payloadType: "Event Message",
            operationMode: "Motion mode",
            temperature: "9°C",
            ack: 9,
            batteryVoltage: "3.1V",
            eventType: "Start of movement"
        });
    });

    // 测试 Battery Consumption 消息
    it('should decode Battery Consumption payload correctly', () => {
        const event = {
            data: {
                port: 9, // Battery Consumption 的 port
                payloadHex: '090A0B0C0D0E0F' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            port: 9,
            hexFormatPayload: "090A0B0C0D0E0F",
            payloadType: "Battery Consumption",
            operationMode: "Standby mode",
            temperature: "10°C",
            ack: 10,
            batteryVoltage: "3.2V",
            gpsWorkTime: 123456,
            wifiWorkTime: 234567,
            bleScanWorkTime: 345678,
            bleAdvWorkTime: 456789,
            loraWorkTime: 567890
        });
    });

    // 测试 Extreme GPS 消息
    it('should decode Extreme GPS payload correctly', () => {
        const event = {
            data: {
                port: 12, // Extreme GPS 的 port
                payloadHex: '0C0D0E0F101112' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            port: 12,
            hexFormatPayload: "0C0D0E0F101112",
            payloadType: "GPS Limit",
            operationMode: "Periodic mode",
            batteryLevel: "Normal",
            tamperAlarm: "Not triggered",
            mandownStatus: "Not in idle",
            motionStateSinceLastPaylaod: "No",
            positioningType: "Normal",
            lorawanDownlinkCount: 3,
            batteryVoltage: "3.3V",
            latitude: 12.3456789,
            longitude: 98.7654321,
            pdop: 1.5
        });
    });
});