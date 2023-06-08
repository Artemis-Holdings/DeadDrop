// @generated automatically by Diesel CLI.

diesel::table! {
    dead_drops (id) {
        id -> Uuid,
        title -> Varchar,
        msg -> Nullable<Bytea>,
        att -> Nullable<Bytea>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}
