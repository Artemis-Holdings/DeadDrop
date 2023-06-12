
use bincode;
use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;
use crate::factory;
use rocket::futures::io;

use crate::schema::dead_drops;
use chrono::Utc;



#[derive(Debug)] // remove before flight
#[derive(Queryable, Selectable, Insertable, AsChangeset)]
#[diesel(table_name = dead_drops)]
#[diesel(check_for_backend(diesel::pg::Pg))]
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

    pub fn create_deaddrop(new_drop: factory::DeadDrop) -> Result<factory::DeadDrop, io::Error> {
        let connection = &mut Service::establish_connection();

        let now = Utc::now().naive_utc();
        let msg_payload = bincode::serialize(&new_drop.message).unwrap();
        let att_payload = bincode::serialize(&new_drop.attachment).unwrap();

        let dead_drop_to_db = DeadDropModel {
            id: new_drop.id,
            title: Some(new_drop.title),
            msg: Some(msg_payload),
            att: Some(att_payload),
            created_at: now,
            updated_at: now,
        };

        let model_from_db = diesel::insert_into(dead_drops::table)
            .values(&dead_drop_to_db)
            .get_result(connection);

        match model_from_db {
            Ok(model) => Ok(Self::model_to_factory(model)),
            Err(e) => Err(io::Error::new(io::ErrorKind::Other, e)),
        }
    }


    pub fn read_deaddrop(id: String) -> Result<factory::DeadDrop, io::Error> {
        let connection = &mut Service::establish_connection();

        let model_from_db = dead_drops::table
            .filter(dead_drops::id.eq(id))
            .first(connection);
            // .expect("DeadDrop Error: Services - Error reading dead drop.");

        // return Self::model_to_factory(model_from_db);
        match model_from_db {
            Ok(model) => Ok(Self::model_to_factory(model)),
            Err(e) => Err(io::Error::new(io::ErrorKind::Other, e)),
        }
    }


    // NOTE: This cannot change a password. Need to look into that in the future.
    pub fn update_deaddrop(update_obj: factory::DeadDrop) -> Result<factory::DeadDrop, io::Error> {
        let connection = &mut Service::establish_connection();

        let now = Utc::now().naive_utc();
        let msg_payload = bincode::serialize(&update_obj.message).unwrap();
        let att_payload = bincode::serialize(&update_obj.attachment).unwrap();

        let model_from_db = diesel::update( dead_drops::table.filter(
                dead_drops::id.eq(update_obj.id)
            ))
            .set((
                dead_drops::title.eq(update_obj.title), 
                dead_drops::msg.eq(msg_payload), 
                dead_drops::att.eq(att_payload), 
                dead_drops::updated_at.eq(now)))
            .get_result(connection);
        
        match model_from_db {
            Ok(model) => Ok(Self::model_to_factory(model)),
            Err(e) => Err(io::Error::new(io::ErrorKind::Other, e)),
        }
    }

    pub fn delete_deaddrop(id: String) -> Result<factory::DeadDrop, io::Error> {
        let connection = &mut Service::establish_connection();

        let model_from_db = diesel::delete(dead_drops::table.filter(dead_drops::id.eq(id)))
            .get_result(connection);


        match model_from_db {
            Ok(model) => Ok(Self::model_to_factory(model)),
            Err(e) => Err(io::Error::new(io::ErrorKind::Other, e)),
        }
    }

    fn establish_connection() -> PgConnection {
        dotenv().ok();

        let database_url = env::var("DATABASE_URL")
            .expect("DeadDrop: DATABASE_URL must be set");
        PgConnection::establish(&database_url)
            .unwrap_or_else(|_| panic!("DeadDrop: Could not connect to {}", database_url))
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