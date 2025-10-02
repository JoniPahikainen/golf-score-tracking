CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


CREATE TYPE "public"."friend_status" AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'blocked'
);

CREATE TYPE "public"."round_status" AS ENUM (
    'active',
    'completed',
    'cancelled'
);

CREATE TYPE "public"."tee_color" AS ENUM (
    'red',
    'white',
    'blue',
    'black',
    'gold'
);


CREATE OR REPLACE FUNCTION "public"."handle_accepted_friend_request"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        -- Insert friendship in both directions
        INSERT INTO friends (user_id, friend_id)
        VALUES (NEW.sender_id, NEW.receiver_id)
        ON CONFLICT (user_id, friend_id) DO NOTHING;
        
        INSERT INTO friends (user_id, friend_id)
        VALUES (NEW.receiver_id, NEW.sender_id)
        ON CONFLICT (user_id, friend_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."handle_ended_friendship"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.status IN ('rejected', 'blocked') AND OLD.status = 'accepted' THEN
        -- Remove friendship records
        DELETE FROM friends 
        WHERE (user_id = NEW.sender_id AND friend_id = NEW.receiver_id)
           OR (user_id = NEW.receiver_id AND friend_id = NEW.sender_id);
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


CREATE TABLE IF NOT EXISTS "public"."course_holes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "hole_number" integer NOT NULL,
    "par" integer NOT NULL,
    "handicap_ranking" integer,
    "description" "text",
    "hole_image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "course_holes_handicap_ranking_check" CHECK ((("handicap_ranking" >= 1) AND ("handicap_ranking" <= 18))),
    CONSTRAINT "course_holes_hole_number_check" CHECK ((("hole_number" >= 1) AND ("hole_number" <= 18))),
    CONSTRAINT "course_holes_par_check" CHECK ((("par" >= 3) AND ("par" <= 6)))
);

CREATE TABLE IF NOT EXISTS "public"."course_tees" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "hole_id" "uuid" NOT NULL,
    "tee_name" character varying(50) NOT NULL,
    "tee_color" "public"."tee_color",
    "length" integer NOT NULL,
    "course_rating" numeric(4,1),
    "slope_rating" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(200) NOT NULL,
    "location" character varying(300),
    "description" "text",
    "website_url" "text",
    "address" "text",
    "city" character varying(100),
    "state" character varying(100),
    "country" character varying(100) DEFAULT 'Finland'::character varying,
    "par_total" integer,
    "hole_count" integer DEFAULT 18,
    "course_type" character varying(50) DEFAULT 'public'::character varying,
    "course_rating" numeric(4,1),
    "slope_rating" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."friend_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "status" "public"."friend_status" DEFAULT 'pending'::"public"."friend_status",
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_not_self" CHECK (("sender_id" <> "receiver_id"))
);

CREATE TABLE IF NOT EXISTS "public"."friends" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "friend_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_not_self" CHECK (("user_id" <> "friend_id"))
);

CREATE TABLE IF NOT EXISTS "public"."player_scores" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "round_player_id" "uuid" NOT NULL,
    "hole_number" integer NOT NULL,
    "strokes" integer DEFAULT 0 NOT NULL,
    "putts" integer DEFAULT 0,
    "fairway_hit" boolean DEFAULT false,
    "green_in_regulation" boolean DEFAULT false,
    "penalties" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    "driving_distance" integer,
    "chip_shots" integer DEFAULT 0,
    "sand_saves" integer DEFAULT 0,
    "approach_distance" integer,
    CONSTRAINT "player_scores_hole_number_check" CHECK ((("hole_number" >= 1) AND ("hole_number" <= 18))),
    CONSTRAINT "player_scores_penalties_check" CHECK ((("penalties" >= 0) AND ("penalties" <= 5))),
    CONSTRAINT "player_scores_putts_check" CHECK ((("putts" >= 0) AND ("putts" <= 10))),
    CONSTRAINT "player_scores_strokes_check" CHECK ((("strokes" >= 1) AND ("strokes" <= 15)))
);

CREATE TABLE IF NOT EXISTS "public"."round_players" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "round_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "handicap_at_time" numeric(4,1) DEFAULT 0.0,
    "total_score" integer DEFAULT 0,
    "total_putts" integer DEFAULT 0,
    "fairways_hit" integer DEFAULT 0,
    "greens_in_regulation" integer DEFAULT 0,
    "total_penalties" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."rounds" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "title" character varying(200),
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "tee_name" character varying(50) NOT NULL,
    "notes" "text",
    "status" "public"."round_status" DEFAULT 'active'::"public"."round_status",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_tournament" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_name" character varying(50) NOT NULL,
    "email" character varying(255),
    "password_hash" "text",
    "first_name" character varying(100),
    "last_name" character varying(100),
    "handicap_index" numeric(4,1) DEFAULT 0.0,
    "date_of_birth" "date",
    "phone" character varying(20),
    "profile_picture_url" "text",
    "preferred_tee_color" "public"."tee_color",
    "is_active" boolean DEFAULT true,
    "email_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE ONLY "public"."course_holes"
    ADD CONSTRAINT "course_holes_course_id_hole_number_key" UNIQUE ("course_id", "hole_number");

ALTER TABLE ONLY "public"."course_holes"
    ADD CONSTRAINT "course_holes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."course_tees"
    ADD CONSTRAINT "course_tees_hole_id_tee_name_key" UNIQUE ("hole_id", "tee_name");

ALTER TABLE ONLY "public"."course_tees"
    ADD CONSTRAINT "course_tees_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "friends_user_id_friend_id_key" UNIQUE ("user_id", "friend_id");

ALTER TABLE ONLY "public"."player_scores"
    ADD CONSTRAINT "player_scores_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."player_scores"
    ADD CONSTRAINT "player_scores_round_player_id_hole_number_key" UNIQUE ("round_player_id", "hole_number");

ALTER TABLE ONLY "public"."round_players"
    ADD CONSTRAINT "round_players_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."round_players"
    ADD CONSTRAINT "round_players_round_id_user_id_key" UNIQUE ("round_id", "user_id");

ALTER TABLE ONLY "public"."rounds"
    ADD CONSTRAINT "rounds_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_name_key" UNIQUE ("user_name");


CREATE INDEX "idx_course_holes_course_id" ON "public"."course_holes" USING "btree" ("course_id");

CREATE INDEX "idx_course_tees_hole_id" ON "public"."course_tees" USING "btree" ("hole_id");

CREATE INDEX "idx_courses_location" ON "public"."courses" USING "btree" ("location");

CREATE INDEX "idx_courses_name" ON "public"."courses" USING "btree" ("name");

CREATE INDEX "idx_friend_requests_receiver" ON "public"."friend_requests" USING "btree" ("receiver_id");

CREATE INDEX "idx_friend_requests_sender" ON "public"."friend_requests" USING "btree" ("sender_id");

CREATE INDEX "idx_friend_requests_status" ON "public"."friend_requests" USING "btree" ("status");

CREATE INDEX "idx_friends_friend" ON "public"."friends" USING "btree" ("friend_id");

CREATE INDEX "idx_friends_user" ON "public"."friends" USING "btree" ("user_id");

CREATE INDEX "idx_player_scores_round_player_id" ON "public"."player_scores" USING "btree" ("round_player_id");

CREATE INDEX "idx_round_players_round_id" ON "public"."round_players" USING "btree" ("round_id");

CREATE INDEX "idx_round_players_user_id" ON "public"."round_players" USING "btree" ("user_id");

CREATE INDEX "idx_rounds_course_id" ON "public"."rounds" USING "btree" ("course_id");

CREATE INDEX "idx_rounds_date" ON "public"."rounds" USING "btree" ("date");

CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");

CREATE INDEX "idx_users_username" ON "public"."users" USING "btree" ("user_name");

CREATE UNIQUE INDEX "uniq_pending_requests" ON "public"."friend_requests" USING "btree" ("sender_id", "receiver_id") WHERE ("status" = 'pending'::"public"."friend_status");

CREATE OR REPLACE TRIGGER "trigger_handle_accepted_friend_request" AFTER UPDATE ON "public"."friend_requests" FOR EACH ROW EXECUTE FUNCTION "public"."handle_accepted_friend_request"();

CREATE OR REPLACE TRIGGER "trigger_handle_ended_friendship" AFTER UPDATE ON "public"."friend_requests" FOR EACH ROW EXECUTE FUNCTION "public"."handle_ended_friendship"();

CREATE OR REPLACE TRIGGER "update_course_holes_updated_at" BEFORE UPDATE ON "public"."course_holes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_course_tees_updated_at" BEFORE UPDATE ON "public"."course_tees" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_courses_updated_at" BEFORE UPDATE ON "public"."courses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_friend_requests_updated_at" BEFORE UPDATE ON "public"."friend_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_player_scores_updated_at" BEFORE UPDATE ON "public"."player_scores" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_round_players_updated_at" BEFORE UPDATE ON "public"."round_players" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_rounds_updated_at" BEFORE UPDATE ON "public"."rounds" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


ALTER TABLE ONLY "public"."course_holes"
    ADD CONSTRAINT "fk_course_holes_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."course_tees"
    ADD CONSTRAINT "fk_course_tees_hole" FOREIGN KEY ("hole_id") REFERENCES "public"."course_holes"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "fk_friend_requests_receiver" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friend_requests"
    ADD CONSTRAINT "fk_friend_requests_sender" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "fk_friends_friend" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."friends"
    ADD CONSTRAINT "fk_friends_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."player_scores"
    ADD CONSTRAINT "fk_player_scores_round_player" FOREIGN KEY ("round_player_id") REFERENCES "public"."round_players"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."round_players"
    ADD CONSTRAINT "fk_round_players_round" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."round_players"
    ADD CONSTRAINT "fk_round_players_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."rounds"
    ADD CONSTRAINT "fk_rounds_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id");

ALTER TABLE ONLY "public"."rounds"
    ADD CONSTRAINT "fk_rounds_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");


GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";