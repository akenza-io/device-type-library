function intToHex(number) {
    let base = Number(number).toString(16);
    if (base.length % 2) {
        base = `0${base}`;
    }

    let hex = "";
    for (let i = 0; i < base.length; i += 2) {
        hex = base.slice(i, i + 2) + hex;
    }

    return hex;
}

function checkExpectedValues(value, defaultValue) {
    if (value !== undefined && value !== null) {
        return value;
    }
    return defaultValue;
}

function consume(event) {
    const port = checkExpectedValues(event.port, 85);
    const confirmed = checkExpectedValues(event.confirmed, true);
    let payloadHex = checkExpectedValues(event.payloadHex, "");

    if (payloadHex.length > 1) {
        emit("downlink", { payloadHex, port, confirmed });
    } else if (event.payload.actionType !== undefined) {
        const { payload } = event;
        switch (payload.actionType) {
            case "reportInterval":
                payloadHex = `FF${intToHex(payload.reportInterval)}`;
                break;
            case "reboot":
                payloadHex = "FF10FF";
                break;
            case "button":
                payloadHex = "FF25";
                if (payload.mode === "ENABLE") {
                    payloadHex += "01";
                } else if (payload.mode === "DISABLE") {
                    payloadHex += "00";
                }
                break;
            case "action":
                payloadHex = "FF3D";
                if (payload.mode === "BUZZ") {
                    payloadHex += "01";
                } else if (payload.mode === "REFRESH") {
                    payloadHex += "02";
                }
                break;
            case "buzzer":
                payloadHex = "FF3E";
                if (payload.mode === "ENABLE") {
                    payloadHex += "01";
                } else if (payload.mode === "DISABLE") {
                    payloadHex += "00";
                }
                break;
            case "displayTemplate":
                payloadHex = "FF73";
                if (payload.mode === "TEMPLATE_2") {
                    payloadHex += "01";
                } else if (payload.mode === "TEMPLATE_1") {
                    payloadHex += "00";
                }
                break;
            case "buttonTemplateSwitch":
                payloadHex = "FF90";
                if (payload.mode === "ENABLE") {
                    payloadHex += "01";
                } else if (payload.mode === "DISABLE") {
                    payloadHex += "00";
                }
                break;
            case "textUpdate": {
                payloadHex = "FB01";
                let bits = "";

                if (payload.template === 1) {
                    bits += "00";
                } else if (payload.template === 1) {
                    bits += "01";
                }
                // Module ? 6 bits

                payload.template
                if (payload.mode === "ENABLE") {
                    payloadHex += "01";
                } else if (payload.mode === "DISABLE") {
                    payloadHex += "00";
                }
                break;
            } default:
                emit("log", { "Something went wrong with": payload });
                break;
        }

        emit("downlink", {
            payloadHex,
            port,
            confirmed: true,
        });
    }
}
