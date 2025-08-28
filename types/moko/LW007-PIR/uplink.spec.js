const decoder = require('./uplink'); // 导入你的 decoder 脚本

describe('Decoder Tests', () => {
    // 测试 heartbeat payload 消息
    it('should decode heartbeat payload correctly', () => {
        const event = {
            data: {
                port: 5, // heartbeat payload 的 port
                payloadHex: '68A8359A101F8DE55F0000' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "door_state": "Door/window is open",
            "door_trigger_times": "0times",
            "humidity": "59.7%",
            "low_battery_status": "Battery level is normal",
            "payload_type": "Information",
            "pir_state": "PIR motion not detected",
            "port": 5,
            "temperature": "26.7°",
            "time": "2025/8/22 17:17:14",
            "timezone": "UTC+08:00"
        });
    });

    // 测试 information payload 消息
    it('should decode information payload correctly', () => {
        const event = {
            data: {
                port: 6, // information 的 port
                payloadHex: '68A8359A101F8DE55F0000' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "door_state": "Door/window is open",
            "door_trigger_times": "0times",
            "humidity": "59.7%",
            "low_battery_status": "Battery level is normal",
            "payload_type": "Information",
            "pir_state": "PIR motion not detected",
            "port": 6,
            "temperature": "26.7°",
            "time": "2025/8/22 17:17:14",
            "timezone": "UTC+08:00"
        });
    });

    // 测试 shutdown payload 消息
    it('should decode shutdown payload correctly', () => {
        const event = {
            data: {
                port: 7, // shutdown payload 的 port
                payloadHex: '68A838E81002' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 7,
            "hexFormatPayload": "68a7fe3e100000000064",
            "low_battery_alarm": "low power alarm function is enabled",
            "low_battery_status": "Battery is normal",
            "payload_type": "Shut Down",
            "time": "2025/8/22 17:31:20",
            "timezone": "UTC+08:00"
        });
    });
});
