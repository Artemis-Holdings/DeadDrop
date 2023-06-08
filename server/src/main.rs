#[macro_use] extern crate rocket;

pub mod factory;
mod models;
pub mod service;


// use bincode::de;
use rocket::tokio::time::{sleep, Duration};
use std::{io, path::{Path, PathBuf}};
use rocket::{get, routes, response::Redirect, fs::NamedFile};
use crate::factory::Ticket;
use crate::service::Service;

use rocket::data::FromData;
use rocket::request::Outcome;
use rocket::http::Status;
use rocket::{Data, Request};
use rocket::request::FromRequest;
use rocket::data;
use rocket::request;
use serde;
// use rocket::tokio::io::AsyncReadExt;




#[derive(Debug)]
#[derive(serde::Deserialize)]
pub struct UserRequest {
    pub title: String,
    pub password: String,
    pub message: String,
    pub action: String,
}


#[rocket::async_trait]
impl<'r> FromRequest<'r> for UserRequest {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {

        
        fn generate_user_request(req: &Request<'_>) -> Result<UserRequest, ()> {
            let title = req.headers().get_one("title").unwrap().to_string();
            let password = req.headers().get_one("password").unwrap().to_string();
            let message = req.headers().get_one("message").unwrap().to_string();
            let action = req.headers().get_one("action").unwrap().to_string();
            Ok( UserRequest {
                title,
                password,
                message,
                action,
            })
        }

        match generate_user_request(req) {
            Ok(user_request) => Outcome::Success(user_request),
            Err(_) => Outcome::Failure((Status::BadRequest, ())),
        }

    }
}


#[post("/api/deaddrop")]
fn deaddrop(req: UserRequest ) -> String {

    // SANDBOX TESTS
    // let test_file = fs::read("test.jpg").unwrap();
    // create the ticket
    let test_ticket = Ticket::new(
        req.title,
        req.message,
        req.password,
        req.action,
        Vec::new(),
        // test_file,
    );
    let dead_drop = test_ticket.generate_deaddrop();
    println!("dead_drop: {:?}", dead_drop);

    let set_obj = Service::create_deaddrop(dead_drop);

    let from_db = Service::read_deaddrop(set_obj.title);
    println!("from_db: {:?}", from_db);

    let updated_ticket = Ticket::new(
        "test title4".to_string(),
        "test messagenew".to_string(),
        "testpassword".to_string(),
        "UPDATE".to_string(),
        Vec::new(),
        // test_file,
    );

    let updated_dead_drop = updated_ticket.generate_deaddrop();
    let updated_obj = Service::update_deaddrop(updated_dead_drop);
    println!("updated_obj: {:?}", updated_obj);

    let deleted_obj = Service::delete_deaddrop(updated_obj.title);
    println!("deleted_obj: {:?}", deleted_obj);

    return format!(" ☠️ DEAD DROP ONLINE ☠️ \n Awaited for 1 second. \n ECHO: {} \n", "test");
}

// SERVE REACT FILES
#[get("/")]
fn index() -> Redirect {
    Redirect::permanent("/index.html")
}

#[get("/<file..>")]
async fn build_dir(file: PathBuf) -> io::Result<NamedFile> {
    NamedFile::open(Path::new("client_build/").join(file)).await
}

// TEST API
#[get("/api/test/<echo>")]
async fn test(echo: &str) -> String {
    sleep(Duration::from_secs(1)).await;
    return format!(" ☠️ DEAD DROP ONLINE ☠️ \n Awaited for 1 second. \n ECHO: {} \n", echo);
}





#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, build_dir, test, deaddrop])
}