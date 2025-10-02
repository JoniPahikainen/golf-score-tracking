# Database Schema (Simplified)

This document lists columns for each table and whether they are Required or Optional.

## Enums

| Name           | Values                              |
|----------------|------------------------------------|
| friend_status  | pending, accepted, rejected, blocked |
| round_status   | active, completed, cancelled        |
| tee_color      | red, white, blue, black, gold       |

## users
| Column              | Non-nullable | Default   | Notes              |
|---------------------|----------|---------------|--------------------|
| id                  | [x] | uuid_generate_v4() | Primary Key        |
| user_name           | [x] |                    | UNIQUE             |
| email               | [ ] |                    | UNIQUE             |
| password_hash       | [ ] |                    |                    |
| first_name          | [ ] |                    |                    |
| last_name           | [ ] |                    |                    |
| handicap_index      | [ ] | 0.0                |                    |
| date_of_birth       | [ ] |                    |                    |
| phone               | [ ] |                    |                    |
| profile_picture_url | [ ] |                    |                    |
| preferred_tee_color | [ ] |                    |                    |
| is_active           | [ ] | true               |                    |
| email_verified      | [ ] | false              |                    |
| created_at          | [ ] | now()              |                    |
| updated_at          | [ ] | now()              |                    |

## courses
| Column        | Non-nullable | Default            | Notes          |
| ------------- | ------------ | ------------------ | -------------- |
| id            | [x]          | uuid_generate_v4() | PK             |
| name          | [x]          |                    |                |
| location      | [ ]          |                    |                |
| description   | [ ]          |                    |                |
| website_url   | [ ]          |                    |                |
| phone         | [ ]          |                    |                |
| email         | [ ]          |                    |                |
| address       | [ ]          |                    |                |
| city          | [ ]          |                    |                |
| state         | [ ]          |                    |                |
| country       | [ ]          | 'Finland'          |                |
| postal_code   | [ ]          |                    |                |
| latitude      | [ ]          |                    |                |
| longitude     | [ ]          |                    |                |
| par_total     | [ ]          |                    |                |
| hole_count    | [ ]          | 18                 |                |
| designer      | [ ]          |                    |                |
| year_built    | [ ]          |                    |                |
| course_type   | [ ]          | 'public'           |                |
| amenities     | [ ]          | []                 | JSON array     |
| course_rating | [ ]          |                    |                |
| slope_rating  | [ ]          |                    |                |
| is_active     | [ ]          | true               | checkbox       |
| created_at    | [ ]          | now()              | auto-timestamp |
| updated_at    | [ ]          | now()              | auto-timestamp |


## course_holes
| Column           | Non-nullable | Default            | Notes                                 |
| ---------------- | ------------ | ------------------ | ------------------------------------- |
| id               | [x]          | uuid_generate_v4() | PK                                    |
| course_id        | [x]          |                    | FK -> courses(id)                     |
| hole_number      | [x]          |                    | 1..18, UNIQUE(course_id, hole_number) |
| par              | [x]          |                    | 3..6                                  |
| handicap_ranking | [ ]          |                    | 1..18                                 |
| description      | [ ]          |                    |                                       |
| hole_image_url   | [ ]          |                    |                                       |
| created_at       | [ ]          | now()              | auto-timestamp                        |
| updated_at       | [ ]          | now()              | auto-timestamp                        |



## course_tees
| Column        | Non-nullable | Default            | Notes                     |
| ------------- | ------------ | ------------------ | ------------------------- |
| id            | [x]          | uuid_generate_v4() | PK                        |
| hole_id       | [x]          |                    | FK -> course_holes(id)    |
| tee_name      | [x]          |                    | UNIQUE(hole_id, tee_name) |
| tee_color     | [ ]          |                    | enum `tee_color`          |
| length        | [x]          |                    |                           |
| course_rating | [ ]          |                    |                           |
| slope_rating  | [ ]          |                    |                           |
| created_at    | [ ]          | now()              | auto-timestamp            |
| updated_at    | [ ]          | now()              | auto-timestamp            |


## friend_requests
| Column      | Non-nullable | Default            | Notes                |
| ----------- | ------------ | ------------------ | -------------------- |
| id          | [x]          | uuid_generate_v4() | PK                   |
| sender_id   | [x]          |                    | FK -> users(id)      |
| receiver_id | [x]          |                    | FK -> users(id)      |
| status      | [ ]          | 'pending'          | enum `friend_status` |
| message     | [ ]          |                    |                      |
| created_at  | [ ]          | now()              | auto-timestamp       |
| updated_at  | [ ]          | now()              | auto-timestamp       |


## friends
| Column     | Non-nullable | Default            | Notes           |
| ---------- | ------------ | ------------------ | --------------- |
| id         | [x]          | uuid_generate_v4() | PK              |
| user_id    | [x]          |                    | FK -> users(id) |
| friend_id  | [x]          |                    | FK -> users(id) |
| created_at | [ ]          | now()              | auto-timestamp  |


## rounds
| Column        | Non-nullable | Default            | Notes               |
| ------------- | ------------ | ------------------ | ------------------- |
| id            | [x]          | uuid_generate_v4() | PK                  |
| course_id     | [x]          |                    | FK -> courses(id)   |
| title         | [ ]          |                    |                     |
| date          | [ ]          | CURRENT_DATE       |                     |
| tee_name      | [x]          |                    |                     |
| notes         | [ ]          |                    |                     |
| status        | [ ]          | 'active'           | enum `round_status` |
| created_by    | [ ]          |                    | FK -> users(id)     |
| created_at    | [ ]          | now()              | auto-timestamp      |
| updated_at    | [ ]          | now()              | auto-timestamp      |
| is_tournament | [ ]          | false              | checkbox            |


## round_players
| Column               | Non-nullable | Default            | Notes            |
| -------------------- | ------------ | ------------------ | ---------------- |
| id                   | [x]          | uuid_generate_v4() | PK               |
| round_id             | [x]          |                    | FK -> rounds(id) |
| user_id              | [x]          |                    | FK -> users(id)  |
| handicap_at_time     | [ ]          | 0.0                |                  |
| total_score          | [ ]          | 0                  |                  |
| total_putts          | [ ]          | 0                  |                  |
| fairways_hit         | [ ]          | 0                  |                  |
| greens_in_regulation | [ ]          | 0                  |                  |
| total_penalties      | [ ]          | 0                  |                  |
| created_at           | [ ]          | now()              | auto-timestamp   |
| updated_at           | [ ]          | now()              | auto-timestamp   |


## player_scores
| Column              | Non-nullable | Default            | Notes                                       |
| ------------------- | ------------ | ------------------ | ------------------------------------------- |
| id                  | [x]          | uuid_generate_v4() | PK                                          |
| round_player_id     | [x]          |                    | FK -> round_players(id)                     |
| hole_number         | [x]          |                    | 1..18, UNIQUE(round_player_id, hole_number) |
| strokes             | [ ]          | 0                  |                                             |
| putts               | [ ]          | 0                  |                                             |
| fairway_hit         | [ ]          | false              | checkbox                                    |
| green_in_regulation | [ ]          | false              | checkbox                                    |
| penalties           | [ ]          | 0                  | 0..5                                        |
| notes               | [ ]          |                    |                                             |
| driving_distance    | [ ]          |                    |                                             |
| chip_shots          | [ ]          | 0                  |                                             |
| sand_saves          | [ ]          | 0                  |                                             |
| approach_distance   | [ ]          |                    |                                             |
| created_at          | [ ]          | now()              | auto-timestamp                              |
| updated_at          | [ ]          | now()              | auto-timestamp                              |

