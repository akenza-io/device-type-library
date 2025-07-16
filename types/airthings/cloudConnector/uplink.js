function deleteUnusedKeys(data) {
  let keysRetained = false;
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || data[key] === null) {
      delete data[key];
    } else {
      keysRetained = true;
    }
  });
  return keysRetained;
}

// Save merge old and new datapoints
function completeSample(data, historicData) {
  const merged = data;

  Object.keys(historicData).forEach((key) => {
    if (data[key] === undefined || data[key] === null) {
      merged[key] = historicData[key];
    }
  });

  return merged;
}

function consume(event) {
  const { data } = event;
  const timestamp = new Date(data.recorded);
  const state = event.state || {};
  data.ratings = data.ratings || {};

  const environment = {};
  environment.temperature = data.temp;
  environment.temperatureRating = data.ratings.temp;
  environment.pressure = data.pressure;
  environment.pressureRating = data.ratings.pressure;
  environment.humidity = data.humidity;
  environment.humidityRating = data.ratings.humidity;
  environment.co2 = data.co2;
  environment.co2Rating = data.ratings.co2;
  environment.tvoc = data.tvoc;
  environment.tvocRating = data.ratings.voc;
  environment.soundLevelA = data.soundLevelA;

  environment.pm1 = data.pm1;
  environment.pm1Rating = data.ratings.pm1;
  environment.pm2_5 = data.pm25;
  environment.pm2_5Rating = data.ratings.pm25;
  environment.pm10 = data.pm10;
  environment.pm10Rating = data.ratings.pm10;


  if (deleteUnusedKeys(environment)) {
    state.environment = completeSample(environment, state.environment || {});
    emit("sample", { data: state.environment, topic: "environment", timestamp });
  }

  const mold = {};
  mold.moldRisk = data.mold;
  mold.moldRiskRating = data.ratings.mold;

  if (deleteUnusedKeys(mold)) {
    state.mold = completeSample(mold, state.mold || {});
    emit("sample", { data: state.mold, topic: "mold", timestamp });
  }

  const virus = {};
  virus.virusRisk = data.virusRisk;
  virus.virusRiskRating = data.ratings.virusRisk;

  if (deleteUnusedKeys(virus)) {
    state.virus = completeSample(virus, state.virus || {});
    emit("sample", { data: state.virus, topic: "virus", timestamp });
  }

  const radon = {};
  radon.hourlyRadon = data.hourlyRadon;
  radon.hourlyRadonRating = data.ratings.hourlyRadon;

  if (deleteUnusedKeys(radon)) {
    state.radon = completeSample(radon, state.radon || {});
    emit("sample", { data: state.radon, topic: "radon", timestamp });
  }

  const lifecycle = {};
  lifecycle.batteryLevel = data.batteryPercentage;
  lifecycle.rssi = data.rssi;
  lifecycle.serialNumber = data.serialNumber;

  if (deleteUnusedKeys(lifecycle)) {
    // Only emit this if batteryLevel is available
    if (lifecycle.batteryLevel !== undefined) {
      emit("sample", { data: lifecycle, topic: "lifecycle", timestamp });
    }
  }

  const occupancy = {};
  if (data.occupants !== undefined) {
    if (data.occupants > 0) {
      occupancy.occupied = true;
      occupancy.occupancy = 2;
    } else {
      occupancy.occupied = false;
      occupancy.occupancy = 0;
    }
    occupancy.occupants = data.occupants;
  }

  if (deleteUnusedKeys(occupancy)) {
    emit("sample", { data: occupancy, topic: "occupancy", timestamp });
  }

  const ventilation = {};
  ventilation.airflow = data.airflow;
  ventilation.airExchangeRate = data.airExchangeRate;

  if (deleteUnusedKeys(ventilation)) {
    state.ventilation = completeSample(ventilation, state.ventilation || {});
    emit("sample", { data: state.ventilation, topic: "ventilation", timestamp });
  }

  const airly = {};
  airly.temperature = data.outdoorTemp;
  airly.pressure = data.outdoorPressure;
  airly.humidity = data.outdoorHumidity;
  airly.pm1 = data.outdoorPm1;
  airly.pm1Rating = data.ratings.outdoorPm1;
  airly.pm10 = data.outdoorPm10;
  airly.pm10Rating = data.ratings.outdoorPm10;
  airly.pm2_5 = data.outdoorPm25;
  airly.pm2_5Rating = data.ratings.outdoorPm25;

  if (deleteUnusedKeys(airly)) {
    state.airly = completeSample(airly, state.airly || {});
    emit("sample", { data: state.airly, topic: "airly", timestamp });
  }

  emit("state", state);
}