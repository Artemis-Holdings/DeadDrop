use crate::factory::{Ticket, DeadDrop};
use crate::service::Service;


/// The controller manages the flow of actions and the majority of the business logic.
/// Do not be confused by the service which handles all connections to the database.
/// 

pub struct Controller;
impl Controller {


    pub fn client_request(ticket: &mut Ticket) -> Ticket {
        match ticket.action.as_str() {
            "CREATE" => Controller::create(ticket),
            // "READ" => self.read(ticket),
            // "UPDATE" => self.update(ticket),
            // "DELETE" => self.delete(ticket),
            _ => panic!("Invalid action"),
        }

        
    }

    fn create(ticket: &mut Ticket) -> Ticket {
        let new = ticket.generate_deaddrop();
        let response = Service::create_deaddrop(new);
        let mut output = response.generate_ticket(ticket.password.clone());
        output.din = ticket.din.clone();

        return output;
    }

    // fn read(){
    //         use self::schema::posts::dsl::*;

    //     let connection = &mut establish_connection();
    //     let results = posts
    //         .filter(published.eq(true))
    //         .limit(5)
    //         .select(Post::as_select())
    //         .load(connection)
    //         .expect("Error loading posts");

    //     println!("Displaying {} posts", results.len());
    //     for post in results {
    //         println!("{}", post.title);
    //         println!("-----------\n");
    //         println!("{}", post.body);
    //     }
    // }

}