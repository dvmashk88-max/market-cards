CREATE TABLE IF NOT EXISTS site_visits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visitor_token_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS site_visits_visitor_token_hash_uidx
  ON site_visits (visitor_token_hash);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id bigint NOT NULL REFERENCES site_visits (id),
  name varchar(50) NOT NULL,
  rating smallint NOT NULL,
  text varchar(500) NOT NULL,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_name_length_check CHECK (char_length(name) BETWEEN 2 AND 50),
  CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_text_length_check CHECK (char_length(text) BETWEEN 5 AND 500)
);

CREATE UNIQUE INDEX IF NOT EXISTS reviews_visit_id_uidx
  ON reviews (visit_id);

CREATE INDEX IF NOT EXISTS reviews_public_created_idx
  ON reviews (created_at DESC)
  WHERE is_visible = true;
