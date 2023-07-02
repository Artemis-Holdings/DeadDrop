use crate::schema::dead_drops;
use crate::factory;

use rocket::futures::io;
use diesel::prelude::*;
use dotenvy::dotenv;
use chrono::Utc;
use std::env;
use bincode;

/// The model is the representation of the database table.
/// This is the only place where the database schema is defined and it should remain that way.
/// 
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

/// # Service
/// The service object is a facade design pattern which handles all connections to the database.
/// Core database features are implemented here (CRUD).
/// Each service method related to a core feature returns a DeadDrop object.
/// 
/// ## Future implementations
/// In the future we want a tombstone feature which will allow us to delete a DeadDrop from the database. 
/// We also want to implement a distribution feature which allows nodes to communicate with eachother.
/// 
pub struct Service;
impl Service {
    /// Creates a dead drop in the database.
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

    /// Reads a dead drop from the database.
    pub fn read_deaddrop(id: String) -> Result<factory::DeadDrop, io::Error> {
        let connection = &mut Service::establish_connection();

        let model_from_db = dead_drops::table
            .filter(dead_drops::id.eq(id))
            .first(connection);

        match model_from_db {
            Ok(model) => Ok(Self::model_to_factory(model)),
            Err(e) => Err(io::Error::new(io::ErrorKind::Other, e)),
        }
    }

    /// Updates a dead drop in the database.
    /// 
    /// A client cannot request to recall a dead drop unless they know the DIN and password.
    /// Since the id is a hash of the DIN and password together, it is impossible to find a dead drop without knowing both.
    /// 
    pub fn update_deaddrop(update_obj: factory::DeadDrop) -> Result<factory::DeadDrop, io::Error> {
        let connection = &mut Service::establish_connection();

        let now = Utc::now().naive_utc();
        let msg_payload = bincode::serialize(&update_obj.message).unwrap();
        let att_payload = bincode::serialize(&update_obj.attachment).unwrap();

        let model_from_db =
            diesel::update(dead_drops::table.filter(dead_drops::id.eq(update_obj.id)))
                .set((
                    dead_drops::title.eq(update_obj.title),
                    dead_drops::msg.eq(msg_payload),
                    dead_drops::att.eq(att_payload),
                    dead_drops::updated_at.eq(now),
                ))
                .get_result(connection);

        match model_from_db {
            Ok(model) => Ok(Self::model_to_factory(model)),
            Err(e) => Err(io::Error::new(io::ErrorKind::Other, e)),
        }
    }

    /// Deletes a dead drop from the database.
    pub fn delete_deaddrop(id: String) -> Result<factory::DeadDrop, io::Error> {
        let connection = &mut Service::establish_connection();

        let model_from_db =
            diesel::delete(dead_drops::table.filter(dead_drops::id.eq(id))).get_result(connection);

        match model_from_db {
            Ok(model) => Ok(Self::model_to_factory(model)),
            Err(e) => Err(io::Error::new(io::ErrorKind::Other, e)),
        }
    }

    /// Provides the connection string to the database.
    fn establish_connection() -> PgConnection {
        // NOTE: Should we change this into a singleton (arch) object?
        dotenv().ok();

        let database_url = env::var("DATABASE_URL").expect("DeadDrop: DATABASE_URL must be set");
        PgConnection::establish(&database_url)
            .unwrap_or_else(|_| panic!("DeadDrop: Could not connect to {}", database_url))
    }

    /// Converts a database model into a factory object.
    fn model_to_factory(model: DeadDropModel) -> factory::DeadDrop {
        factory::DeadDrop {
            id: model.id,
            title: model.title.unwrap(),
            message: bincode::deserialize(&model.msg.unwrap()).unwrap(),
            attachment: bincode::deserialize(&model.att.unwrap()).unwrap(),
        }
    }
}
