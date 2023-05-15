use rocket::tokio::time::{sleep, Duration};
use std::{io, path::{Path, PathBuf}};
use rocket::{get, routes, response::Redirect, fs::NamedFile};


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
#[get("/ping/<echo>")]
async fn delay(echo: &str) -> String {
    sleep(Duration::from_secs(1)).await;
    return format!(" ☠️ DEAD DROP ONLINE ☠️ \n Awaited for 1 second. \n ECHO: {} \n", echo);
}


// POST API. Accept a ticket object for processing



#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, build_dir, delay])
}