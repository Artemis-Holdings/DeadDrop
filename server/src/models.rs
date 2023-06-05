// /// Modes serve as a way to represent the data in the database.
// /// These objects look very simalar to the objects found in the factory, but these maintain types specific to Diesel.
// /// The types in models help Diesel to understand how to interact with the database.
// /// 

// // TODO: remove Debug trait from models.

// use uuid::Uuid;
// // use crate::schema::dead_drop;

// use diesel::prelude::*;
// // use chrono::{DateTime, Utc};
// // use diesel::pg::Pg;
// use diesel::deserialize::Queryable;

// // use the dead_drop table from the file schema.rs
// use dead_drop_server::schema::dead_drop;

// #[derive(Debug)]
// #[derive(Queryable, Selectable)]
// #[diesel(table_name = dead_drop)]
// #[diesel(check_for_backend(diesel::pg::Pg))]
// pub struct DeadDrop {
//     pub id: Uuid,
//     pub title: String,
//     pub msg: Option<Vec<u8>>,
//     pub att: Option<Vec<u8>>,
//     pub created_at: chrono::NaiveDateTime,
//     pub updated_at: chrono::NaiveDateTime,

// }

// #[derive(Insertable)]
// #[diesel(table_name = dead_drop)]
// pub struct NewDeadDrop {
//     pub id: Uuid,
//     pub title: String,
//     pub msg: Option<Vec<u8>>,
//     pub att: Option<Vec<u8>>,
//     pub created_at: chrono::NaiveDateTime,
//     pub updated_at: chrono::NaiveDateTime,    
// }
