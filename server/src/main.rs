pub mod factory;
use std::fs;

use bincode::de;
use rocket::tokio::time::{sleep, Duration};
use std::{io, path::{Path, PathBuf}};
use rocket::{get, routes, response::Redirect, fs::NamedFile};
use crate::factory::Ticket;

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
        "test title".to_string(),
        "test message".to_string(),
        "testpassword".to_string(),
        "CREATE".to_string(),
        Vec::new(),
        // test_file,
    );
    let dead_drop = test_ticket.generate_deaddrop();
    println!("dead_drop: {:?}", dead_drop);
    // pass ticket to controller
    let msg = dead_drop.msg_decrypt("testpassword".to_string());
    println!("dead_drop: {:?}", msg);

    return format!(" ☠️ DEAD DROP ONLINE ☠️ \n Awaited for 1 second. \n ECHO: {} \n", "test");
}


#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, build_dir, test, deaddrop])
}