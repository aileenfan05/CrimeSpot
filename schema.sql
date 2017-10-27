CREATE TABLE incident (
  uuid VARCHAR(36) PRIMARY KEY,
  category VARCHAR(255),
  date date,
  pd_district VARCHAR(255),
  resolution VARCHAR(255)
);