const decoder = require('./uplink'); // 导入你的 decoder 脚本

describe('Decoder Tests', () => {
    // 测试 switch payload 消息
    it('should decode switch payload correctly', () => {
        const event = {
            data: {
                port: 5, // switch payload 的 port
                payloadHex: '68a7ec46100000' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 5,
            "hexFormatPayload": "68a7ec46100000",
            "ac_output_state": "OFF",
            "payload_type": "Switch",
            "plug_load_status": "No load on the plug",
            "time": "2025/8/22 12:4:22",
            "timezone": 8
        });
    });

    // 测试 electrical payload 消息
    it('should decode electrical payload correctly', () => {
        const event = {
            data: {
                port: 6, // electrical 的 port
                payloadHex: '68a7ecfa1008b70000c32d' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 6,
            "hexFormatPayload": "68a7ecfa1008b70000c32d",
            "instantaneous_current": "0A",
            "instantaneous_current_frequency": "49.965HZ",
            "instantaneous_voltage": "223.1V",
            "payload_type": "Electrical",
            "time": "2025/8/22 12:7:22",
            "timezone": 8
        });
    });

    // 测试 electrical payload 消息
    it('should decode electrical payload correctly', () => {
        const event = {
            data: {
                port: 7, // electrical payload 的 port
                payloadHex: '68a7fe3e100000000064' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 7,
            "hexFormatPayload": "68a7fe3e100000000064",
            "instantaneous_active_power": "0W",
            "instantaneous_power_factor": "100%",
            "payload_type": "Electrical",
            "time": "2025/8/22 13:21:2",
            "timezone": 8
        });
    });

    // 测试 Energy 消息
    it('should decode Energy payload correctly', () => {
        const event = {
            data: {
                port: 8, // Energy 的 port
                payloadHex: '68a81dd6100000020a0000' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 8,
            "hexFormatPayload": "68a81dd6100000020a0000",
            "energy_of_last_hour": "0KWH",
            "payload_type": "Energy",
            "time": "2025/8/22 15:35:50",
            "timezone": 8,
            "total_energy": "0.163125KWH"
        });
    });

    // 测试 Over voltage 消息
    it('should decode over_voltage_state payload correctly', () => {
        const event = {
            data: {
                port: 9, // Vibration 的 port
                payloadHex: '68a81dd610010ce40898' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 9,
            "hexFormatPayload": "68a81dd610010ce40898",
            "payload_type": "Over-voltage",
            "time": "2025/8/22 15:35:50",
            "timezone": 8,
            "over_voltage_state": true,
            "current_instantaneous_voltage": "330.0V",
            "over_voltage_threshold": "220.0V"
        });
    });

    // 测试 Sag voltage 消息
    it('should decode sag_voltage_state payload correctly', () => {
        const event = {
            data: {
                port: 10, // Vibration 的 port
                payloadHex: '68a81dd6100108340898' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 10,
            "hexFormatPayload": "68a81dd6100108340898",
            "payload_type": "Sag-voltage",
            "time": "2025/8/22 15:35:50",
            "timezone": 8,
            "sag_voltage_state": true,
            "current_instantaneous_voltage": "210.0V",
            "sag_voltage_threshold": "220.0V"
        });
    });

    // 测试 Over current 消息
    it('should decode over_current_state payload correctly', () => {
        const event = {
            data: {
                port: 11, // Vibration 的 port
                payloadHex: '68a81dd6100103e803e6' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 11,
            "hexFormatPayload": "68a81dd6100103e803e6",
            "payload_type": "Over-current",
            "time": "2025/8/22 15:35:50",
            "timezone": 8,
            "over_current_state": true,
            "current_instantaneous_current": "1.000A",
            "over_current_threshold": "0.998A"
        });
    });

    // 测试 Over load 消息
    it('should decode overload_state payload correctly', () => {
        const event = {
            data: {
                port: 12, // Vibration 的 port
                payloadHex: '68a81dd6100100640060' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 12,
            "hexFormatPayload": "68a81dd6100103e803e6",
            "payload_type": "Over-load",
            "time": "2025/8/22 15:35:50",
            "timezone": 8,
            "over_load_state": true,
            "current_instantaneous_power": "10.0W",
            "over_load_threshold": "9.6W"
        });
    });

    // 测试load states 消息
    it('should decode load states payload correctly', () => {
        const event = {
            data: {
                port: 13, // Battery Consumption 的 port
                payloadHex: '0198d0c01b77020066310814aaedaf65' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 13,
            "hexFormatPayload": "0198d0c01b77020066310814aaedaf65",
            "load_change_state": "load starts working",
            "payload_type": "Load state",
            "time": "2025/8/22 15:49:53",
            "timezone": 8
        });
    });

    // Count down
    it('should decode ac_output_state_after_countdown payload correctly', () => {
        const event = {
            data: {
                port: 14, // Extreme GPS 的 port
                payloadHex: '68a81dd6100100000009' // 示例 payload
            }
        };

        const result = decoder.consume(event);

        expect(result).toEqual({
            "port": 14,
            "hexFormatPayload": "68a81dd6100100000009",
            "payload_type": "Over-load",
            "time": "2025/8/22 15:35:50",
            "timezone": 8,
            "ac_output_state_after_countdown": "ON",
            "remaining_time_of_countdown_process": "9s"
        });
    });
});