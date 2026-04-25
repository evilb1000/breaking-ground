export type SparklineData = {
  window_months: number;
  periods: string[];
  values: number[];
  start_value: number;
  end_value: number;
  min_value: number;
  max_value: number;
  delta_over_window: number;
  is_up_from_start: boolean;
  width: number;
  height: number;
  points: [number, number][];
};

export type SparklineSeries = {
  series_id: string;
  material_name: string;
  cluster: string;
  latest_value: number;
  MoM_Change: number;
  YoY_Change: number;
  change_since_mar2020: number;
  avg_monthly_change_since_mar2020: number;
  rank_in_cluster: number;
  cluster_avg_monthly_change: number;
  sparkline_24m: SparklineData;
};

export type SparklineJson = {
  latest_period: string;
  source_json: string;
  sparkline_window_months: number;
  series: SparklineSeries[];
};
