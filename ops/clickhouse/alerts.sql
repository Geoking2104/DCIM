CREATE DATABASE IF NOT EXISTS dcim;

CREATE TABLE IF NOT EXISTS dcim.alerts (
  at DateTime64(3),
  title String,
  status String,
  payload String
) ENGINE = MergeTree
ORDER BY at;
