    CREATE TABLE companies (
        handle TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        num_employees INTEGER,
        description TEXT,
        logo_url TEXT
    );

    CREATE TABLE jobs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        salary FLOAT NOT NULL,
        equity FLOAT NOT NULL CHECK (equity <= 1.0),
        company_handle TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
        date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE users (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        photo_url TEXT,
        is_admin BOOLEAN NOT NULL DEFAULT false
    );

    CREATE TABLE applications(
    username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
    job_id INTEGER  REFERENCES jobs ON DELETE CASCADE,
    state TEXT,
    created_at TIMESTAMP DEFAULT current_timestamp,
    PRIMARY KEY(username, job_id)
);
