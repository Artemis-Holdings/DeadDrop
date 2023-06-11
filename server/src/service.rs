
use bincode;
use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;
use crate::factory;

use crate::schema::dead_drops;
// use uuid::Uuid;
use chrono::Utc;



#[derive(Debug)] // remove before flight
#[diesel(table_name = dead_drops)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[derive(Queryable, Selectable, Insertable, AsChangeset)]
pub struct DeadDropModel {
    pub id: String,
    pub title: Option<String>,
    pub msg: Option<Vec<u8>>,
    pub att: Option<Vec<u8>>,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,

}

pub struct Service;
impl Service {


    fn establish_connection() -> PgConnection {
        dotenv().ok();

        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL must be set");
        PgConnection::establish(&database_url)
            .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
    }


    pub fn create_deaddrop(dead_drop_to_write: factory::DeadDrop) -> factory::DeadDrop {
        let connection = &mut Service::establish_connection();

        let now = Utc::now().naive_utc();
        let msg_payload = bincode::serialize(&dead_drop_to_write.message).unwrap();
        let att_payload = bincode::serialize(&dead_drop_to_write.attachment).unwrap();

        let dead_drop_to_db = DeadDropModel {
            id: dead_drop_to_write.id,
            title: Some(dead_drop_to_write.title),
            msg: Some(msg_payload),
            att: Some(att_payload),
            created_at: now,
            updated_at: now,
        };

        let model_from_db: DeadDropModel = diesel::insert_into(dead_drops::table)
            .values(&dead_drop_to_db)
            .get_result(connection)
            .expect("DeadDrop Error: Services - Error creating dead drop.");

        return Self::model_to_factory(model_from_db);
    }


    pub fn read_deaddrop(id: String) -> factory::DeadDrop {
        let connection = &mut Service::establish_connection();

        let model_from_db: DeadDropModel = dead_drops::table
            .filter(dead_drops::id.eq(id))
            .first(connection)
            .expect("DeadDrop Error: Services - Error reading dead drop.");

        return Self::model_to_factory(model_from_db);
    }


    // NOTE: This cannot change a password. Need to look into that in the future.
    pub fn update_deaddrop(dead_drop_to_update: factory::DeadDrop) -> factory::DeadDrop {
        let connection = &mut Service::establish_connection();

        let now = Utc::now().naive_utc();
        let msg_payload = bincode::serialize(&dead_drop_to_update.message).unwrap();
        let att_payload = bincode::serialize(&dead_drop_to_update.attachment).unwrap();

        let model_from_db: DeadDropModel = diesel::update( dead_drops::table.filter(
                dead_drops::id.eq(dead_drop_to_update.id)
            ))
            .set((
                dead_drops::title.eq(dead_drop_to_update.title), 
                dead_drops::msg.eq(msg_payload), 
                dead_drops::att.eq(att_payload), 
                dead_drops::updated_at.eq(now)))
            .get_result(connection)
            .expect("DeadDrop Error: Services - Error updating dead drop.");

        return Self::model_to_factory(model_from_db);
    }

    pub fn delete_deaddrop(id: String) -> factory::DeadDrop {
        let connection = &mut Service::establish_connection();

        let model_from_db: DeadDropModel = diesel::delete(dead_drops::table.filter(dead_drops::id.eq(id)))
            .get_result(connection)
            .expect("DeadDrop Error: Services - Error deleting dead drop.");
        return Self::model_to_factory(model_from_db);
    }

    fn model_to_factory(model: DeadDropModel) -> factory::DeadDrop {
        factory::DeadDrop {
            id: model.id,
            title: model.title.unwrap(),
            message: bincode::deserialize(&model.msg.unwrap()).unwrap(),
            attachment: bincode::deserialize(&model.att.unwrap()).unwrap(),
        }
    }

}