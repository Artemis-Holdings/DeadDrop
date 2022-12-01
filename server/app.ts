import * as http from "http";
import express, { Express } from "express";
import bodyParser from "body-parser";

import morgan from "morgan";

export class Server {
    private readonly _app: Express;
    private release: string;


    get app(): Express {
        return this._app;
    }

    private _server!: http.Server;

    get server(): http.Server {
        return this._server;
    }

    constructor() {
        this._app = express();
        this._app.set("port", process.env.PORT || 8080);
        this.configureMiddleware();

        this.release = process.env.RELEASE || "dev";
    }

    public configureMiddleware() {
        // Required for POST requests
        this._app.use(bodyParser.json());
        this._app.use(bodyParser.urlencoded({ extended: true }));
        this._app.use(morgan(this.release === "production" ? "combined" : this.release))
        // CORS
        this.app.use(function (req, res, next) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization");
            next();
        });
    }

    public start() {
        this._server = this._app.listen(this._app.get("port"), () => {
            console.log("🚀 Dead-Drop is running on port ", this._app.get("port"));
            console.log("RELEASE: ", this.release)
        });
    }

}