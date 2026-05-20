function consume(event) {
  const { data } = event;
  const { topic } = event;

  if (topic == "configuration") {
    delete data.apn;
    delete data.apnPassword;
    delete data.apnUsername;

    data.networkSearchDisablePeriodBase = data.networkSearch.disablePeriodBase;
    data.networkSearchTimeSchemaLastRegistrationNotOk = data.networkSearch.timeSchemaLastRegistrationNotOk;
    data.networkSearchCounterMax = data.networkSearch.counterMax;
    data.networkSearchTimeSchemaLastRegistrationOk = data.networkSearch.timeSchemaLastRegistrationOk;
    delete data.networkSearch;

    data.bleAdvertisingPeriodMode = data.bleAdvertisingPeriod.mode;
    data.bleAdvertisingPeriodNormal = data.bleAdvertisingPeriod.normal;
    data.bleAdvertisingPeriodFast = data.bleAdvertisingPeriod.fast;
    delete data.bleAdvertisingPeriod;
  } else if (topic == "lifecycle") {
    if (data.batteryStatus) {
      data.batteryStatus = "OK";
    } else {
      data.batteryStatus = "DISCHARGED";
    }

    data.signalStrength = data.signal + -110;
    delete data.signal;
  }
  // Topic measurements


  emit('sample', { data, topic });
}