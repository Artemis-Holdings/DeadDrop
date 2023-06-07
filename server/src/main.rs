pub mod factory;
mod models;
pub mod service;
// use std::fs;

// use bincode::de;
use rocket::tokio::time::{sleep, Duration};
use std::{io, path::{Path, PathBuf}};
use rocket::{get, routes, response::Redirect, fs::NamedFile};
use crate::factory::Ticket;
use crate::service::Service;

#[macro_use] extern crate rocket;

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


#[post("/api/deaddrop")]
async fn deaddrop() -> String {

    // let test_file = fs::read("test.jpg").unwrap();
  

    // create the ticket
    let test_ticket = Ticket::new(
        "test title2".to_string(),
        "test message".to_string(),
        "testpassword".to_string(),
        "CREATE".to_string(),
        Vec::new(),
        // test_file,
    );
    let dead_drop = test_ticket.generate_deaddrop();
    println!("dead_drop: {:?}", dead_drop);

    let set_obj = Service::create_deaddrop(dead_drop);

    let from_db = Service::read_deaddrop(set_obj.title);
    println!("from_db: {:?}", from_db);

    let updated_ticket = Ticket::new(
        "test title2".to_string(),
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


#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, build_dir, test, deaddrop])
}