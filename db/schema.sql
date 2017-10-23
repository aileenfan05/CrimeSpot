CREATE TABLE incident (
  uuid VARCHAR(36) PRIMARY KEY,
  category VARCHAR(255),
  date date,
  pd_district VARCHAR(255),
  resolution VARCHAR(255)
);

-- CREATE TABLE incident_summary (
--   category VARCHAR(255),
--   pd_district VARCHAR(255),
--   count INT,
--   week_start date
-- );
