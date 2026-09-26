CREATE DATABASE IF NOT EXISTS dcim;

CREATE TABLE IF NOT EXISTS dcim.control_log (
  at DateTime64(3),
  action_id String,
  action String,
  planned_for DateTime64(3),
  status String
) ENGINE = MergeTree
ORDER BY at;
