CREATE TABLE incident (
  uuid VARCHAR(36) PRIMARY KEY,
  category VARCHAR(255),
  date date,
  pd_district VARCHAR(255),
  resolution VARCHAR(255)
);

CREATE TABLE incident (
  uuid  SERIAL PRIMARY KEY,
  category VARCHAR(255),
  date date,
  pd_district VARCHAR(255),
  resolution VARCHAR(255)
 );

CREATE TABLE test (
  uuid  SERIAL PRIMARY KEY,
  name character varying(50),
  age INT
);