
use bincode;
use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;
use crate::factory;

// use dead_drop_server::{*, schema::dead_drop};
use dead_drop_server::schema::dead_drop;
use uuid::Uuid;
use chrono::{DateTime, Utc};



#[derive(Debug)]
#[derive(Queryable, Selectable, Insertable)]
#[diesel(table_name = dead_drop)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct DeadDropModel {
    pub id: Uuid,
    pub title: String,
    pub msg: Option<Vec<u8>>,
    pub att: Option<Vec<u8>>,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,

}

pub struct Service;
impl Service {

    fn establish_connection() -> PgConnection {
        dotenv().ok();

        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        PgConnection::establish(&database_url)
            .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
    }

    pub fn create_deaddrop(dead_drop_to_write: factory::DeadDrop) -> DeadDropModel {
        let connection = &mut Service::establish_connection();

        let now = Utc::now().naive_utc();
        let msg_payload = bincode::serialize(&dead_drop_to_write.message).unwrap();
        let att_payload = bincode::serialize(&dead_drop_to_write.attachment).unwrap();

        let dead_drop_to_db = DeadDropModel {
            id: dead_drop_to_write.id,
            title: dead_drop_to_write.title,
            msg: Some(msg_payload),
            att: Some(att_payload),
            created_at: now,
            updated_at: now,
        };

        diesel::insert_into(dead_drop::table)
            .values(&dead_drop_to_db)
            .get_result(connection)
            .expect("Error saving new dead drop")
    }

    pub fn read_deaddrop(title: String) -> DeadDropModel {
        let connection = &mut Service::establish_connection();

        dead_drop::table
            .filter(dead_drop::title.eq(title))
            .first(connection)
            .expect("Error reading dead drop")
    }



}