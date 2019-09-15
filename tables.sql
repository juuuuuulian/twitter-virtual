CREATE TABLE IF NOT EXISTS app_use (
    id SERIAL PRIMARY KEY,
    remote TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);
ALTER DATABASE twitter_virtual SET timezone = 'UTC';
