#[cfg(test)]
mod unit_tests {
    use crate::controller::Controller;
    use crate::factory::{DeadDrop, Payload, Ticket};
    use crate::service::Service;

    #[test]
    // a test where the properties found in ticket are always the same
    fn validate_ticket_shape() {
        let ticket = Ticket {
            din: "123ab".to_string(),
            title: "test".to_string(),
            message: "test".to_string(),
            password: "test".to_string(),
            action: "test".to_string(),
            attachment: Vec::new(),
        };
        assert_eq!(ticket.din, "123ab");
        assert_eq!(ticket.title, "test");
        assert_eq!(ticket.message, "test");
        assert_eq!(ticket.password, "test");
        assert_eq!(ticket.action, "test");
        // assert_eq!(ticket.attachment, Vec::new());
    }

    #[test]
    fn ticket_can_make_din_if_missing() {
        let mut ticket = Ticket {
            din: "".to_string(),
            title: "test".to_string(),
            message: "test".to_string(),
            password: "test".to_string(),
            action: "test".to_string(),
            attachment: Vec::new(),
        };
        ticket.generate_id();

        assert_eq!(ticket.din.len(), 5);
    }

    #[test]
    fn ticket_always_generates_same_id_with_same_input() {
        let known = "0dcc218d21f360bf985e5b7dcaa6fda2695a4558f2664cbd2ef681f3984767ae";

        let mut ticket = Ticket {
            din: "123ab".to_string(),
            title: "test".to_string(),
            message: "test".to_string(),
            password: "test".to_string(),
            action: "test".to_string(),
            attachment: Vec::new(),
        };
        let id = ticket.generate_id();

        assert_eq!(id, known);
    }

    #[test]

    fn ticket_can_generate_deaddrop() {
        let original = DeadDrop {
            id: "0dcc218d21f360bf985e5b7dcaa6fda2695a4558f2664cbd2ef681f3984767ae".to_string(),
            title: "".to_string(),
            message: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
            attachment: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
        };

        let mut ticket = Ticket {
            din: "123ab".to_string(),
            title: "".to_string(),
            message: "".to_string(),
            password: "test".to_string(),
            action: "".to_string(),
            attachment: Vec::new(),
        };

        let deaddrop = ticket.generate_deaddrop();

        assert_eq!(deaddrop, original);
    }

    #[test]
    fn deaddrop_is_correct_shape() {
        let deaddrop = DeadDrop {
            id: "0dcc218d21f360bf985e5b7dcaa6fda2695a4558f2664cbd2ef681f3984767ae".to_string(),
            // TODO: make the title encrypted
            title: "".to_string(),
            message: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
            attachment: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
        };

        assert_eq!(deaddrop.id.len(), 64);
        assert_eq!(deaddrop.title, "");
        assert_eq!(deaddrop.message.binaries, Vec::new());
        assert_eq!(deaddrop.message.public_keys, Vec::new());
        assert_eq!(deaddrop.attachment.binaries, Vec::new());
        assert_eq!(deaddrop.attachment.public_keys, Vec::new());
    }

    #[test]
    fn deaddrop_generates_ticket() {
        let deaddrop = DeadDrop {
            id: "0dcc218d21f360bf985e5b7dcaa6fda2695a4558f2664cbd2ef681f3984767ae".to_string(),
            title: "".to_string(),
            message: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
            attachment: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
        };

        let ticket = deaddrop.generate_ticket(String::from("test")).unwrap();

        assert_eq!(ticket.din.len(), 0);
        assert_eq!(ticket.title, "");
        assert_eq!(ticket.message, "");
        assert_eq!(ticket.password, "");
        assert_eq!(ticket.action, "");
        assert_eq!(ticket.attachment.is_empty(), true);
    }

    #[test]
    #[should_panic]
    //method create_deaddrop returns an error because there is no database connection
    fn create_service_panics_for_no_connection() {
        let deaddrop = DeadDrop {
            id: "0dcc218d21f360bf985e5b7dcaa6fda2695a4558f2664cbd2ef681f3984767ae".to_string(),
            title: "".to_string(),
            message: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
            attachment: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
        };

        let result = Service::create_deaddrop(deaddrop);
        assert_eq!(result.is_err(), true);
    }

    #[test]
    #[should_panic]
    //method create_deaddrop returns an error because there is no database connection
    fn read_service_panics_for_no_connection() {
        let deaddrop = DeadDrop {
            id: "0dcc218d21f360bf985e5b7dcaa6fda2695a4558f2664cbd2ef681f3984767ae".to_string(),
            title: "".to_string(),
            message: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
            attachment: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
        };

        let result = Service::read_deaddrop(deaddrop.id);
        assert_eq!(result.is_err(), true);
    }

    #[test]
    #[should_panic]
    //method create_deaddrop returns an error because there is no database connection
    fn update_service_panics_for_no_connection() {
        let deaddrop = DeadDrop {
            id: "0dcc218d21f360bf985e5b7dcaa6fda2695a4558f2664cbd2ef681f3984767ae".to_string(),
            title: "".to_string(),
            message: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
            attachment: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
        };

        let result = Service::update_deaddrop(deaddrop);
        assert_eq!(result.is_err(), true);
    }

    #[test]
    #[should_panic]
    //method create_deaddrop returns an error because there is no database connection
    fn delete_service_panics_for_no_connection() {
        let deaddrop = DeadDrop {
            id: "0dcc218d21f360bf985e5b7dcaa6fda2695a4558f2664cbd2ef681f3984767ae".to_string(),
            title: "".to_string(),
            message: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
            attachment: Payload {
                binaries: Vec::new(),
                public_keys: Vec::new(),
            },
        };

        let result = Service::delete_deaddrop(deaddrop.id);
        assert_eq!(result.is_err(), true);
    }

    #[test]
    fn controller_returns_an_error_if_no_action_provided() {
        let mut ticket = Ticket {
            din: "123ab".to_string(),
            title: "".to_string(),
            message: "".to_string(),
            password: "test".to_string(),
            action: "".to_string(),
            attachment: Vec::new(),
        };

        let result = Controller::client_request(&mut ticket);
        assert_eq!(result.is_err(), true);
    }

    #[test]
    #[should_panic]
    fn controller_create_panics_if_no_database_connection() {
        let mut ticket = Ticket {
            din: "123ab".to_string(),
            title: "".to_string(),
            message: "".to_string(),
            password: "test".to_string(),
            action: "CREATE".to_string(),
            attachment: Vec::new(),
        };

        let result = Controller::client_request(&mut ticket);
        assert_eq!(result.is_err(), true);
    }

    #[test]
    #[should_panic]
    fn controller_read_panics_if_no_database_connection() {
        let mut ticket = Ticket {
            din: "123ab".to_string(),
            title: "".to_string(),
            message: "".to_string(),
            password: "test".to_string(),
            action: "READ".to_string(),
            attachment: Vec::new(),
        };

        let result = Controller::client_request(&mut ticket);
        assert_eq!(result.is_err(), true);
    }

    #[test]
    #[should_panic]
    fn controller_update_panics_if_no_database_connection() {
        let mut ticket = Ticket {
            din: "123ab".to_string(),
            title: "".to_string(),
            message: "".to_string(),
            password: "test".to_string(),
            action: "UPDATE".to_string(),
            attachment: Vec::new(),
        };

        let result = Controller::client_request(&mut ticket);
        assert_eq!(result.is_err(), true);
    }

    #[test]
    #[should_panic]
    fn controller_delete_panics_if_no_database_connection() {
        let mut ticket = Ticket {
            din: "123ab".to_string(),
            title: "".to_string(),
            message: "".to_string(),
            password: "test".to_string(),
            action: "DELETE".to_string(),
            attachment: Vec::new(),
        };

        let result = Controller::client_request(&mut ticket);
        assert_eq!(result.is_err(), true);
    }
}
