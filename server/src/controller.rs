// accept a ticket object for processing
// CREATE
// READ
// UPDATE
// DELETE

use self::models::*;
use diesel::prelude::*;
use dead_drop_server::*;


/// The controller manages the flow of actions and the majority of the business logic.
/// Do not be confused by the service which handles all connections to the database.
/// 
struct Controller {
    // db: Database,
    // config: Config,
}

impl Controller {
    pub fn new() -> Self {
        Controller {
            // db: Database::new(),
            // config: Config::new(),
        }
    }

    pub fn manage_action(&self, ticket: Ticket) -> ClientResponse {
        match ticket.action {
            "CREATE" => self.create(ticket),
            "READ" => self.read(ticket),
            "UPDATE" => self.update(ticket),
            "DELETE" => self.delete(ticket),
            _ => panic!("Invalid action"),
        }
    }

    fn create(&self, ticket: Ticket) -> DeadDrop {
        // generate the id
        let id = Uuid::new_v4();
        // generate the payloads
        let (message, attachment) = self.generate_payload(&ticket.message, &ticket.attachment);
        // let attachment = self.attachment_payload(self.attachment);
        // generate the dead drop
        let dead_drop = DeadDrop {
            id: id,
            title: ticket.title.clone(),
            message: message,
            attachment: attachment,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };


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