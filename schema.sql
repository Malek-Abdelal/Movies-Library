DROP TABLE IF EXISTS movies;
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    lang VARCHAR(255),
    title VARCHAR(255),
    overview VARCHAR(255),
    comments VARCHAR(255)
);