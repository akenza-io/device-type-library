/**
* The consume(event) function is the entry point for the script and will be invoked upon execution.
* An error will be returned if the script doesn't implement a consume(event) function.
* @param {ConsumeEvent} event
*/
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
                const topic = dnpDecoded.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') + "-" + message.Filter

                /* sanitize payload keys */
                const newPayload = {};
                const payload = message.Payload;
                Object.keys(payload).forEach(key => {
                    const newKey = key.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/ /g, "_");
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