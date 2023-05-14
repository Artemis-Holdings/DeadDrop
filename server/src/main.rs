use rocket::tokio::time::{sleep, Duration};

#[macro_use] extern crate rocket;

#[get("/")]
fn index() -> &'static str {
    // TODO: return the client build site
    return "Hello, world! I'm a Rust server!";
}

#[get("/ping/<echo>")]
async fn delay(echo: &str) -> String {
    sleep(Duration::from_secs(1)).await;
    return format!(" ☠️ DEAD DROP ONLINE ☠️ \n Awaited for 1 second. \n ECHO: {} \n", echo);
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, delay])
}
