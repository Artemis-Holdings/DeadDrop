// accept a ticket object for processing
// CREATE
// READ
// UPDATE
// DELETE

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

    pub fn switch(&self, ticket: Ticket) -> DeadDrop {
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
            // created_at: Utc::now(),
            // updated_at: Utc::now(),
        };

        
        // return the dead drop
        return dead_drop;
    }

}