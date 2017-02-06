ALTER DATABASE catalyst_db SET TIMEZONE TO 'UTC';

DROP TABLE IF EXISTS role CASCADE;

CREATE TABLE role (
  bit SMALLINT PRIMARY KEY NOT NULL,
  name varchar(50)
);

INSERT INTO role (bit, name)
  VALUES  (2, 'Admin'),
          (4, 'Dev Team'),
          (8, 'Coach'),
          (16, 'Content Creator'),
          (32, 'Student'),
          (64, 'Casual');

DROP TABLE IF EXISTS account CASCADE;

CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  email VARCHAR (255) NOT NULL,
  upassword VARCHAR NOT NULL,
  name VARCHAR (255) NOT NULL,
  summoner_name VARCHAR,
  summoner_id INTEGER UNIQUE,
  discord_name VARCHAR (60),
  region VARCHAR DEFAULT 'EUW',
  date_joined TIMESTAMPTZ NOT NULL DEFAULT (now()),
  can_email BOOLEAN DEFAULT true,
  role SMALLINT DEFAULT 64,
  max_weekly_sessions smallint default 1
);

DROP TABLE IF EXISTS student CASCADE;

CREATE TABLE student (
  student_id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL UNIQUE,
  primary_lane VARCHAR,
  primary_lane_champions JSONB,
  secondary_lane VARCHAR,
  secondary_lane_champions JSONB,
  about_me TEXT,
  CONSTRAINT fk_account_id FOREIGN KEY (account_id)
      REFERENCES public.Account (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
);


DROP TABLE IF EXISTS coach_notes CASCADE;

CREATE TABLE coach_notes (
  coach_note_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL UNIQUE,
  coach_id INTEGER NOT NULL UNIQUE,
  note TEXT NOT NULL,
  time_created TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_student_id FOREIGN KEY (student_id)
      REFERENCES public.Account (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT fk_coach_id FOREIGN KEY (coach_id)
      REFERENCES public.Account (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
);

DROP TABLE IF EXISTS coach CASCADE;

CREATE TABLE coach (
  coach_id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL UNIQUE,
  peak_rank VARCHAR,
  timezone VARCHAR,
  top_roles JSONB,
  main_champs JSONB,
  about_me TEXT,
  CONSTRAINT fk_account_id FOREIGN KEY (account_id)
      REFERENCES public.Account (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

DROP TABLE IF EXISTS availability CASCADE;

CREATE TABLE availability (
  session_id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL,
  available_time TIMESTAMPTZ NOT NULL,
  booked BOOLEAN DEFAULT false,
  CONSTRAINT fk_coach_id FOREIGN KEY (coach_id)
      REFERENCES public.Account (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
);

DROP TABLE IF EXISTS lesson CASCADE;

CREATE TABLE lesson (
  session_id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  lesson_time TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT false,
  coach_note_id INTEGER,
  vod_link VARCHAR,
  CONSTRAINT fk_coach_id FOREIGN KEY (coach_id)
      REFERENCES public.Account (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT fk_student_id FOREIGN KEY (student_id)
      REFERENCES public.Account (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
);
