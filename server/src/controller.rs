use rocket::futures::io;

use crate::factory::Ticket;
use crate::service::Service;

/// # Controller
/// The controller manages the flow of actions for tickets.
/// Do not be confused by the Service which handles all connections to the database.
///
/// The majority of business logic occurs here however encryption and object generation occurs in the factory.
///
/// Actions are passed through the header of the HTTP request,
/// Actions avilable are: CREATE, READ, UPDATE, DELETE
/// 
/// ## Future Implimentations
/// - [ ] Tombstone Scavanger
/// - [ ] Distribution (Seance)
///
pub struct Controller;
impl Controller {
    /// The `client_request` method takes a ticket and is matched against the acitons property.
    pub fn client_request(ticket: &mut Ticket) -> Result<Ticket, io::Error> {
        match ticket.action.as_str() {
            "CREATE" => Controller::create(ticket),
            "READ" => Controller::read(ticket),
            "UPDATE" => Controller::update(ticket),
            "DELETE" => Controller::delete(ticket),
            _ => Err(io::Error::new(io::ErrorKind::Other, "Invalid action")),
        }
    }

    fn create(ticket: &mut Ticket) -> Result<Ticket, io::Error> {
        let to_write = ticket.generate_deaddrop();

        let result = Service::create_deaddrop(to_write)?.generate_ticket(ticket.password.clone());

        match result {
            Ok(mut output) => {
                Controller::redact(&mut output);
                output.din = ticket.din.clone();
                Ok(output)
            }
            Err(err) => Err(io::Error::new(io::ErrorKind::Other, err)),
        }
    }

    fn read(ticket: &mut Ticket) -> Result<Ticket, io::Error> {
        let id = ticket.generate_id();
        let password = ticket.password.clone();

        let result = Service::read_deaddrop(id)?.generate_ticket(password);

        match result {
            Ok(output) => Ok(output),
            Err(err) => Err(io::Error::new(io::ErrorKind::Other, err)),
        }
    }

    fn update(ticket: &mut Ticket) -> Result<Ticket, std::io::Error> {
        let updated = ticket.generate_deaddrop();
        let result = Service::update_deaddrop(updated)?.generate_ticket(ticket.password.clone());

        match result {
            Ok(mut output) => {
                Controller::redact(&mut output);
                Ok(output)
            }
            Err(err) => Err(io::Error::new(io::ErrorKind::Other, err)),
        }
    }

    fn delete(ticket: &mut Ticket) -> Result<Ticket, std::io::Error> {
        match Controller::read(ticket) {
            Ok(_) => {
                let result = Service::delete_deaddrop(ticket.generate_id())?
                    .generate_ticket(ticket.password.clone());

                match result {
                    Ok(mut output) => {
                        Controller::redact(&mut output);
                        Ok(output)
                    }
                    Err(err) => Err(io::Error::new(io::ErrorKind::Other, err)),
                }
            }
            Err(err) => return Err(err),
        }
    }

    /// The `redact` method is used to remove non-essential information from the ticket.
    /// This reduces an attack surface and reduces overhead on the network.
    /// If your method modifies the database, it should be redacted prior to returning.
    ///
    fn redact(ticket: &mut Ticket) {
        ticket.message = String::from("");
        ticket.attachment = Vec::new();
        ticket.title = String::from("");
    }
}
