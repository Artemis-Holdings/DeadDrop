#[macro_use]
extern crate rocket;

pub mod controller;
pub mod factory;
pub mod schema;
pub mod service;
mod tests;

// Internal imports
use crate::controller::Controller;
use crate::factory::Ticket;

// External imports
use std::path::{Path, PathBuf};
use std::io::Cursor;
use rocket::{fs::NamedFile, get, response::Redirect, routes};
use rocket::{response, tokio::time::{sleep, Duration}};
use rocket::response::{status, Responder, Response};
use rocket::request::{FromRequest, Outcome};
use rocket::http::Status;
use rocket::futures::io;
use rocket::data::Data;
use rocket::Request;
use serde;

/// # Static deployment
/// The root address serves the static build of the React file.
/// 
// TODO: implement end to end session encryption that is deployed when the client is served.
#[get("/")]
fn index() -> Redirect {
    Redirect::permanent("/index.html")
}
#[get("/<file..>")]
async fn build_dir(file: PathBuf) -> io::Result<NamedFile> {
    NamedFile::open(Path::new("client_build/").join(file)).await
}

/// This is an async test endpoint that will sleep for 1 second before returning a response.
// TODO: Make this only available when the server is in debug mode.
#[get("/api/test/<echo>")]
async fn test(echo: &str) -> status::Custom<String> {
    sleep(Duration::from_secs(1)).await;
    let output = format!(
        " 
☠️ DEAD DROP ONLINE ☠️ \n 
ECHO: {} \n",
        echo
    );
    return status::Custom(Status::ImATeapot, output);
}
/// Primary client endpoint for core dead drop functionality.
///  All client communication occurs through the `api/deaddrop` endpoint.
/// 5 parameters are passed through the header of the HTTP request:
/// - din
/// - title
/// - password
/// - message
/// - action
/// The attachment is passed through the body as serialized data.
/// 
///  ## Actions
/// The action property is used to determine the flow of the request.
/// They are CASE SENSITIVE.
/// There are 4 actions available:
/// - CREATE
/// - READ
/// - UPDATE
/// - DELETE
/// 
/// 
#[post("/api/deaddrop", data = "<body>")]
async fn deaddrop(req: ClientRequest, body: Data<'_>) -> ClientResponse {
    let attachment = stream_attachement(body).await;

    match attachment {
        Ok(attachment) => {

            let mut req = Ticket::new(
                req.din,
                req.title,
                req.message,
                req.password,
                req.action,
                attachment,
                req.filename
            );

            let response = Controller::client_request(&mut req);

            return ClientResponse::transmit(response);

        },
        Err(err) => {
            return ClientResponse::transmit(Err(err));
        }
    }

}


// POST API. Accept a ticket object for processing



#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, build_dir, test, deaddrop])
    // .register("/", catchers![err_500])
}

/// # The Client Request
/// Rocket, the HTTP framework, processes the request here then passes it to the endpoint.
/// If the request is malformed, the endpoint will return a Bad Request error.
/// Even if the value is empty, the headder must include: din, title, password, message, and action.
/// Example:
/// ```json
/// {
///     "din": "aaaaa",
///     "title": "",
///     "password": "",
///     "message": "",
///     "action": "READ"
/// }
/// ```
/// ref: [Rocket Docs-Guards](https://rocket.rs/master/guide/requests/#request-guards)
/// 
#[derive(Debug, serde::Deserialize)]
struct ClientRequest {
    pub din: String,
    pub title: String,
    pub password: String,
    pub message: String,
    pub action: String,
    pub filename: String
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
            let filename = req.headers().get_one("filename").unwrap().to_string();
            Ok(ClientRequest {
                din,
                title,
                password,
                message,
                action,
                filename
            })
        }

        match generate_user_request(req) {
            Ok(user_request) => Outcome::Success(user_request),
            Err(err) => Outcome::Failure((Status::BadRequest, err)),
        }
    }
}

/// # Response
/// The response sent back to the client is not an object.
/// Instead, the response is a series of headers and a streamed body.
/// The headers are:
/// - din
/// - title
/// - message
/// - notice
/// 
/// The body is the attachment as a stream of bytes.
/// 
/// ## Error Handling
/// If the request is successful, the status code will be 200.
/// And the notice will be "Success".
/// It is possible to receive a 200 status code and still have an error.
/// For example, if the client requests a ticket that does not exist, the status code will be 200.
/// But the notice will be "Ticket does not exist".
/// 
/// ref: [Rocket Docs-Responders](https://rocket.rs/master/guide/responses/#custom-responders)
/// 
struct ClientResponse {
    din: String,
    title: String,
    message: String,
    attachment: Vec<u8>,
    notice: String,
    filename: String
}

impl ClientResponse {
    fn transmit(ticket: Result<Ticket, io::Error>) -> Self {
        match ticket {
            Ok(ticket) => Self {
                din: ticket.din,
                title: ticket.title,
                message: ticket.message,
                attachment: ticket.attachment,
                notice: "Success".to_string(),
                filename: ticket.filename
            },
            Err(err) => Self {
                din: String::new(),
                title: String::new(),
                message: String::new(),
                attachment: Vec::new(),
                notice: err.to_string(),
                filename: String::new()
            }
        }
    }
}
#[rocket::async_trait]
impl<'r> Responder<'r, 'static> for ClientResponse {
    fn respond_to(self, _: &'r Request<'_>) -> response::Result<'static> {
        // TODO: Allow errors to change the status code.
        let mut status = Status::Ok;
        if self.notice != "Success" {
            status = Status::BadRequest;
        }
        let res = Response::build()
            .status(status)
            .raw_header("server", "DeadDrop")
            .raw_header("din", self.din)
            .raw_header("title", self.title)
            .raw_header("message", self.message)
            .streamed_body(Cursor::new(self.attachment))
            .raw_header("notice", self.notice)
            .raw_header("filename", self.filename)
            .finalize();

        Ok(res)
    }
}

/// This is a helper function to the client's attachement into an array of bytes.
async fn stream_attachement(data: Data<'_>) -> Result<Vec<u8>, io::Error> {
    // TODO: Max upload should be configurable.
    let max_upload_size = "1MB".parse().unwrap();
    let attachment = data.open(max_upload_size)
        .into_bytes()
        .await;

    match attachment {
        Ok(attachment) => {
            if attachment.is_complete() {
                return Ok(attachment.into_inner());
            } else {
                return Ok(Vec::new());
            }
        },
        Err(err) => return Err(err),
    }
}
