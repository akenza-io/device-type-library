const decoder = require('./uplink'); // 导入你的 decoder 脚本

describe('Decoder Tests', () => {
    // 测试 Heartbeat 消息
    it('should decode Heartbeat payload correctly', () => {
        const event = {
            data: {
                port: 1, // Heartbeat 的 port
                payloadHex: '211be0014700000000' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 1,
            "hexFormatPayload": "211be0014700000000",
            "payloadType": "Heartbeat",
            "operationMode": "Periodic mode",
            "tamperAlarm": "Not triggered",
            "mandownStatus": "Not in idle",
            "motionStateSinceLastPaylaod": "Yes",
            "temperature": "27°C",
            "ack": 0,
            "batteryVoltage": "3.6V",
            "rebootReason": "Bluetooth command request",
            "firmwareVersion": "V1.0.7",
            "activityCount": 0
        });
    });

    // 测试 Location Fixed 消息
    it('should decode Location Fixed payload correctly', () => {
        const event = {
            data: {
                port: 2, // Location Fixed 的 port
                payloadHex: '011be00207e9040b082a33000912278998443aa12912' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 2,
            "hexFormatPayload": "011be00207e9040b082a33000912278998443aa12912",
            "payloadType": "Location Fixed",
            "operationMode": "Periodic mode",
            "tamperAlarm": "Not triggered",
            "mandownStatus": "Not in idle",
            "motionStateSinceLastPaylaod": "No",
            "positioningType": "Normal",
            "temperature": "27°C",
            "ack": 0,
            "batteryVoltage": "3.6V",
            "positionSuccessType": "GPS positioning success",
            "positionSuccessTypeCode": 2,
            "timestamp": "2025-4-11 8:42:51  TZ:0",
            "latitude": 30.4581016,
            "longitude": 114.4693033,
            "pdop": 1.8
        });
    });

    // 测试 Location Failure 消息
    it('should decode Location Failure payload correctly', () => {
        const event = {
            data: {
                port: 3, // Location Failure 的 port
                payloadHex: '011af00500' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 3,
            "hexFormatPayload": "011af00500",
            "payloadType": "Location Failure",
            "operationMode": "Periodic mode",
            "tamperAlarm": "Not triggered",
            "mandownStatus": "Not in idle",
            "motionStateSinceLastPaylaod": "No",
            "positioningType": "Normal",
            "temperature": "26°C",
            "ack": 0,
            "batteryVoltage": "3.7V",
            "reasonsForPositioningFailure": "Bluetooth broadcasting in progress (Please reduce the Bluetooth broadcast timeout or avoid Bluetooth positioning when Bluetooth broadcasting in process via MKLoRa app)"
        });
    });

    // 测试 Shutdown 消息
    it('should decode Shutdown payload correctly', () => {
        const event = {
            data: {
                port: 4, // Shutdown 的 port
                payloadHex: '211af002' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 4,
            "hexFormatPayload": "211af002",
            "payloadType": "Shutdown",
            "operationMode": "Periodic mode",
            "tamperAlarm": "Not triggered",
            "mandownStatus": "Not in idle",
            "motionStateSinceLastPaylaod": "Yes",
            "temperature": "26°C",
            "ack": 0,
            "batteryVoltage": "3.7V",
            "shutdownType": "Magnetic to turn off the device"
        });
    });

    // 测试 Vibration 消息
    it('should decode Vibration payload correctly', () => {
        const event = {
            data: {
                port: 5, // Vibration 的 port
                payloadHex: '211be00001' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 5,
            "hexFormatPayload": "211be00001",
            "payloadType": "Shock",
            "operationMode": "Periodic mode",
            "tamperAlarm": "Not triggered",
            "mandownStatus": "Not in idle",
            "motionStateSinceLastPaylaod": "Yes",
            "temperature": "27°C",
            "ack": 0,
            "batteryVoltage": "3.6V",
            "numberOfShocks": 1
        });
    });

    // 测试 Man Down 消息
    it('should decode Man Down payload correctly', () => {
        const event = {
            data: {
                port: 6, // Man Down 的 port
                payloadHex: '1117e10040' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 6,
            "hexFormatPayload": "1117e10040",
            "payloadType": "Man Down detection",
            "operationMode": "Periodic mode",
            "tamperAlarm": "Not triggered",
            "mandownStatus": "In idle",
            "motionStateSinceLastPaylaod": "No",
            "temperature": "23°C",
            "ack": 1,
            "batteryVoltage": "3.6V",
            "totalIdleTime": 64
        });
    });

    // 测试 Tamper 消息
    it('should decode Tamper payload correctly', () => {
        const event = {
            data: {
                port: 7, // Tamper 的 port
                payloadHex: '0b1be007e9040b09073300' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 7,
            "hexFormatPayload": "0b1be007e9040b09073300",
            "payloadType": "Tamper Alarm",
            "operationMode": "Motion mode",
            "tamperAlarm": "Triggered",
            "mandownStatus": "Not in idle",
            "motionStateSinceLastPaylaod": "No",
            "temperature": "27°C",
            "ack": 0,
            "batteryVoltage": "3.6V",
            "timestamp": "2025-4-11 9:7:51  TZ:0"
        });
    });

    // 测试 Event 消息
    it('should decode Event payload correctly', () => {
        const event = {
            data: {
                port: 8, // Event 的 port
                payloadHex: '231be000' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 8,
            "hexFormatPayload": "231be000",
            "payloadType": "Event Message",
            "operationMode": "Motion mode",
            "tamperAlarm": "Not triggered",
            "mandownStatus": "Not in idle",
            "motionStateSinceLastPaylaod": "Yes",
            "temperature": "27°C",
            "ack": 0,
            "batteryVoltage": "3.6V",
            "eventType": "Start of movement"
        });
    });

    // 测试 Battery Consumption 消息
    it('should decode Battery Consumption payload correctly', () => {
        const event = {
            data: {
                port: 9, // Battery Consumption 的 port
                payloadHex: '011ae1000220a60000000000000000000afee500000148' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 9,
            "hexFormatPayload": "011ae1000220a60000000000000000000afee500000148",
            "payloadType": "Battery Consumption",
            "operationMode": "Periodic mode",
            "tamperAlarm": "Not triggered",
            "mandownStatus": "Not in idle",
            "motionStateSinceLastPaylaod": "No",
            "temperature": "26°C",
            "ack": 1,
            "batteryVoltage": "3.6V",
            "gpsWorkTime": 139430,
            "wifiWorkTime": 0,
            "bleScanWorkTime": 0,
            "bleAdvWorkTime": 720613,
            "loraWorkTime": 328
        });
    });

    // 测试 Extreme GPS 消息
    it('should decode Extreme GPS payload correctly', () => {
        const event = {
            data: {
                port: 12, // Extreme GPS 的 port
                payloadHex: '01e112278c97443aa3d411' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 12,
            "hexFormatPayload": "01e112278c97443aa3d411",
            "payloadType": "GPS Limit",
            "operationMode": "Periodic mode",
            "batteryLevel": "Normal",
            "tamperAlarm": "Not triggered",
            "mandownStatus": "Not in idle",
            "motionStateSinceLastPaylaod": "No",
            "positioningType": "Normal",
            "lorawanDownlinkCount": 1,
            "batteryVoltage": "3.6V",
            "latitude": 30.4581783,
            "longitude": 114.4693716,
            "pdop": 1.7
        });
    });
});