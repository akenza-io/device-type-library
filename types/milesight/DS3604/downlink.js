
function consume(event) {
    const port = event.port ? event.port : 1;
    const confirmed = event.confirmed ? event.confirmed : false;
    const { payload } = event;
    emit("downlink", { payloadHex: payload, port, confirmed });
}