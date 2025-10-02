// Special EF CD AB -> AB CD EF Case
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

function ascii2hex(str) {
    const arr = [];
    for (let i = 0, l = str.length; i < l; i++) {
        const hex = Number(str.charCodeAt(i)).toString(16);
        arr.push(hex);
    }
    return arr.join('');
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

    // Pass raw downlink
    if (payloadHex.length > 1) {
        emit("downlink", { payloadHex, port, confirmed });
    } else if (event.payload.length !== undefined || event.payload.actionType !== undefined) {
        let { payload } = event;

        // Backwards compatibility
        if (event.payload.actionType !== undefined) {
            payload = [payload];
        }

        payload.forEach(command => {
            switch (command.actionType) {
                case "reportInterval":
                    payloadHex += `FF${intToHex(command.reportInterval)}`;
                    break;
                case "reboot":
                    payloadHex += "FF10FF";
                    break;
                case "button":
                    payloadHex += "FF25";
                    if (command.mode === "ENABLE") {
                        payloadHex += "01";
                    } else if (command.mode === "DISABLE") {
                        payloadHex += "00";
                    }
                    break;
                case "action":
                    payloadHex += "FF3D";
                    if (command.mode === "BUZZ") {
                        payloadHex += "01";
                    } else if (command.mode === "REFRESH") {
                        payloadHex += "02";
                    }
                    break;
                case "buzzer":
                    payloadHex += "FF3E";
                    if (command.mode === "ENABLE") {
                        payloadHex += "01";
                    } else if (command.mode === "DISABLE") {
                        payloadHex += "00";
                    }
                    break;
                case "displayTemplate":
                    payloadHex += "FF73";
                    if (command.mode === "TEMPLATE_2") {
                        payloadHex += "01";
                    } else if (command.mode === "TEMPLATE_1") {
                        payloadHex += "00";
                    }
                    break;
                case "buttonTemplateSwitch":
                    payloadHex += "FF90";
                    if (command.mode === "ENABLE") {
                        payloadHex += "01";
                    } else if (command.mode === "DISABLE") {
                        payloadHex += "00";
                    }
                    break;
                case "contentUpdate": {
                    // Channel and type
                    payloadHex += "FB01";
                    let bits = "";
                    // IDs start at 0
                    if (command.template === 1) {
                        bits += "00";
                    } else if (command.template === 2) {
                        bits += "01";
                    } else {
                        // Return here to not brick the sensor
                        payloadHex = ""; // Catch illegal downlinks
                        emit("log", { "Something went wrong with": command });
                        break;
                    }

                    // IDs start at 0
                    let templateBits = "";
                    templateBits += (command.moduleId - 1).toString(2);

                    // Module ID
                    while (templateBits.length !== 6) {
                        templateBits = 0 + templateBits;
                    }
                    bits += templateBits;

                    // tempBits to hex
                    let tempHex = parseInt(bits, 2).toString(16);
                    while (tempHex.length !== 2) {
                        tempHex = 0 + tempHex;
                    }
                    payloadHex += tempHex;

                    // ACII Encoded Hex
                    const contentHex = ascii2hex(command.content);
                    // 1 Byte content size
                    payloadHex += intToHex(contentHex.length / 2);
                    payloadHex += contentHex;

                    // Channel, Type, Value
                    payloadHex += "FF3D02";
                    break;
                } default:
                    payloadHex = ""; // Catch illegal downlinks
                    emit("log", { "Something went wrong with": command });
                    break;
            }
        });

        emit("downlink", {
            payloadHex,
            port,
            confirmed: true,
        });
    }
}
