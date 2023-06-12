use crate::factory::Ticket;
use crate::service::Service;


/// The controller manages the flow of actions for tickets.
/// Do not be confused by the Service which handles all connections to the database.
/// 
/// The majority of business logic occurs here however encryption and object generation occurs in the factory.
/// 
/// Actions are passed through the header of the HTTP request,
/// Actions avilable are: CREATE, READ, UPDATE, DELETE
/// 
pub struct Controller;
impl Controller {


    pub fn client_request(ticket: &mut Ticket) -> Ticket {
        match ticket.action.as_str() {
            "CREATE" => Controller::create(ticket),
            "READ" => Controller::read(ticket),
            "UPDATE" => Controller::update(ticket),
            "DELETE" => Controller::delete(ticket),
            _ => panic!("Invalid action"),
        }

        
    }

    fn create(ticket: &mut Ticket) -> Ticket {
        let new = ticket.generate_deaddrop();
        let response = Service::create_deaddrop(new);
        let mut output = response.generate_ticket(ticket.password.clone());

        Controller::redact(&mut output);
        output.din = ticket.din.clone();
        
        return output;
    }

    fn read(ticket: &mut Ticket) -> Ticket {
        let dead_drop = Service::read_deaddrop(ticket.generate_id());
        let mut output = dead_drop.generate_ticket(ticket.password.clone());

        output.din = String::from("");

        return output;
    }

    fn update(ticket: &mut Ticket) -> Ticket {
        let updated = ticket.generate_deaddrop();
        let response = Service::update_deaddrop(updated);
        let mut output = response.generate_ticket(ticket.password.clone());

        Controller::redact(&mut output);

        return output;
    }

    
    fn delete(ticket: &mut Ticket) -> Ticket {
        let dead_drop = Service::delete_deaddrop(ticket.generate_id());
        let mut output = dead_drop.generate_ticket(ticket.password.clone());

        Controller::redact(&mut output);

        return output;
     }


     /// The redact function is used to remove non-essential information from the ticket.
     /// This reduces an attack surface and reduces overhead on the network.
     /// 
     fn redact(ticket: &mut Ticket) {
        ticket.din = String::from("");
        ticket.message = String::from("");
        ticket.attachment = Vec::new();
        ticket.title = String::from("");
     }
}

