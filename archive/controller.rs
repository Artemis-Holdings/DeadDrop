use self::models::*;
use diesel::prelude::*;
use crate::factory;
use crate::service::Service;


/// The controller manages the flow of actions and the majority of the business logic.
/// Do not be confused by the service which handles all connections to the database.
/// 
pub struct Controller {
    pub service: Service,
}

impl Controller {
    pub fn new() -> Controller {
        Controller {
            service: Service::new(),
        }
    }

    pub fn manage_action(&self, ticket: factory::Ticket) -> ClientResponse {
        match ticket.action {
            "CREATE" => self.create(ticket),
            "READ" => self.read(ticket),
            "UPDATE" => self.update(ticket),
            "DELETE" => self.delete(ticket),
            _ => panic!("Invalid action"),
        }
    }

    fn create(&self, ticket: Ticket) -> factory::DeadDrop {
        let dead_drop = ticket.create_dead_drop();

        let output = self.service.create(dead_drop);
        prntln!("Created dead drop: {}", output);

        // return the dead drop
        return dead_drop;
    }

    fn read(){
            use self::schema::posts::dsl::*;

        let connection = &mut establish_connection();
        let results = posts
            .filter(published.eq(true))
            .limit(5)
            .select(Post::as_select())
            .load(connection)
            .expect("Error loading posts");

        println!("Displaying {} posts", results.len());
        for post in results {
            println!("{}", post.title);
            println!("-----------\n");
            println!("{}", post.body);
        }
    }

}