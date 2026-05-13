package fit.iuh.adminservice.prediction;

import fit.iuh.adminservice.dto.prediction.ForecastResult;
import fit.iuh.adminservice.dto.prediction.TimeSeriesData;

public interface ForecastAlgorithm {
    ForecastResult forecast(TimeSeriesData historicalData, int numberOfPeriods);
    String getName();
}
