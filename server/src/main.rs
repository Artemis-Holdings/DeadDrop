#[macro_use] extern crate rocket;

pub mod factory;
pub mod service;
pub mod controller;
pub mod schema;
use rocket::{tokio::{time::{sleep, Duration}}, response};
use std::{io, path::{Path, PathBuf}};
use rocket::{get, routes, response::Redirect, fs::NamedFile};
use crate::factory::Ticket;
use crate::controller::Controller;

use std::io::Cursor;
use rocket::request::Outcome;
use rocket::http::Status;
use rocket::Request;
use rocket::request::FromRequest;
use rocket::data::Data;
use serde;
use rocket::response::status;

use rocket::response::{Response, Responder};




#[derive(Debug)]
#[derive(serde::Deserialize)]
pub struct ClientRequest {
    pub din: String,
    pub title: String,
    pub password: String,
    pub message: String,
    pub action: String,
}
#[rocket::async_trait]
impl<'r> FromRequest<'r> for ClientRequest {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {

        fn generate_user_request(req: &Request<'_>) -> Result<ClientRequest, ()> {
            let din = req.headers().get_one("din").unwrap().to_string();
            let title = req.headers().get_one("title").unwrap().to_string();
            let password = req.headers().get_one("password").unwrap().to_string();
            let message = req.headers().get_one("message").unwrap().to_string();
            let action = req.headers().get_one("action").unwrap().to_string();

            Ok( ClientRequest {
                din,
                title,
                password,
                message,
                action,
            })
        }

        match generate_user_request(req) {
            Ok(user_request) => Outcome::Success(user_request),
            Err(_) => Outcome::Failure((Status::BadRequest, ())), // TODO: Add actual err object
        }

    }
}

struct ClientResponse {
    din: String,
    title: String,
    message: String,
    attachment: Vec<u8>,
    notice: String,
}
impl ClientResponse {
    fn transmit(ticket: Ticket) -> Self {
        Self {
            din: ticket.din,
            title: ticket.title,
            message: ticket.message,
            attachment: ticket.attachment,
            notice: String::new(),
        }
    }
}


#[rocket::async_trait]
impl<'r> Responder<'r, 'static> for ClientResponse {
    fn respond_to(self, _: &'r Request<'_>) -> response::Result<'static> {

        let res = Response::build()
            .raw_header("server", "DeadDrop")
            .raw_header("din", self.din)
            .raw_header("title", self.title)
            .raw_header("message", self.message)
            .streamed_body( Cursor::new(self.attachment))
            .raw_header("notice", self.notice)
            .finalize();
        
        Ok(res)
    }

}



#[post("/api/deaddrop", data = "<body>")]
async fn deaddrop(req: ClientRequest, body: Data<'_> ) -> ClientResponse {

    let attachment = stream_attachement(body).await.unwrap();
    let mut req = Ticket::new(
        req.din, 
        req.title, 
        req.message, 
        req.password, 
        req.action, 
        attachment
    );

    let response = Controller::client_request(&mut req);

    return ClientResponse::transmit(response);
}


async fn stream_attachement(data: Data<'_>) -> Result<Vec<u8>, Vec<u8>> {
    // TODO: Max upload should be configurable.
    let max_upload_size = "1MB".parse().unwrap();
    let attachment = data.open(max_upload_size).into_bytes().await.unwrap();

    if attachment.is_complete() {
        return Ok(attachment.into_inner());
    } else {
        return Err(Vec::new());
    }

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
async fn test(echo: &str) -> status::Custom<String> {
    sleep(Duration::from_secs(1)).await;
    let output = format!(" 
☠️ DEAD DROP ONLINE ☠️ \n 
ECHO: {} \n", echo
    );
    return status::Custom(Status::ImATeapot, output);
}





#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, build_dir, test, deaddrop])
}
