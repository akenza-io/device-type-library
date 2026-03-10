function toCamelCase(str) {
    return str.replace(/(_([a-z0-9]))|( ([a-z0-9]))/g, (match) => {
        let transformed = match.replace(/[^0-9a-z ]/gi, '');
        return transformed.toUpperCase();
    });
}


function consume(event) {

    if (event.data.data != null) {
        parseSystemMonitoring(event.data.data);
    }

    if (event.data.Messages != null) {

        for (const message of event.data.Messages) {

            /* only process data, e.g. no observation messages */
            if (/* message.Filter == "processDataInput"  || */ message.Filter == "observation") {
                /* dnp-decode and sanitize message source, 
                   oi4 uses comma as the global mask character instead of % */
                const key = message.Source;
                const uriComponent = key.replace(/,/g, '%');
                const dnpDecoded = decodeURIComponent(uriComponent);
                const topic = dnpDecoded.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') + "-" + message.Filter;

                /* sanitize payload keys */
                const newPayload = {};
                const payload = message.Payload;
                Object.keys(payload).forEach(key => {
                    let newKey = key[0].toLowerCase() + key.substring(1); // Lowercases starting character
                    newKey = toCamelCase(newKey); // Make it camelcase
                    newKey = newKey.replace(/[^0-9a-z]/gi, ''); // Removes non alphanumeric chars

                    newPayload[newKey] = payload[key];
                });

                emit('sample', { data: newPayload, topic: topic });
            }
        }
    }
}

function parseSystemMonitoring(data) {
    let systemMonitoringData = {};

    systemMonitoringData.cpuLoadPercent = data[0].cpu.average;
    systemMonitoringData.memoryFreeMegaByte = parseInt(data[0].memory.free / 1000000);
    emit('sample', { data: systemMonitoringData, topic: "system_monitoring" });

}