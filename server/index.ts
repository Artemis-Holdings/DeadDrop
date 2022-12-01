import { Server } from './app';
import { Request, Response } from 'express';

import { Controllers } from './controllers';

enum METHOD {
    GET = 'get',
    POST = 'post'
}

const server = new Server();

// Use the routeConfig decorator to establish the route, then use a public method to return the response from the controller to the user.
/* BASIC PATTERN FOR ROUTES
    @routeConfig({
        method: METHOD.GET, // or put or delete or whatever REST method
        path: "/path/to/nowhere" //the URL
    })
    public changeMe(req: Request, res: Response){
        return Controller.staticMethodFromControler(req, res)
    }
 */
class Routes {
    @routeConfig({
        method: METHOD.GET,
        path: "/"
    })
    public root(req: Request, res: Response
    ) {
        return Controllers.availabilityTest(req, res);
    }




    @routeConfig({
        method: METHOD.POST,
        path: "/post"
    })
    public async postExample(req: Request, res: Response) {
        let timeoutId;
        try {
            const result = new Promise((resolve) => {
                timeoutId = setTimeout(() => {
                    resolve("After 2 seconds");
                }, 2000)
            });

            return await result;
        } catch (error) {
            timeoutId && clearTimeout(timeoutId);
            return "Some error message";
        }
    }


}

interface RouteConfigProps {
    method: METHOD;
    path: string;
}

function routeConfig({method, path}: RouteConfigProps): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const response = (req: Request, res: Response) => {
            const original = descriptor.value(req, res);

            res.status(200).json(original);
        }

        server.app[method](path, response);
    }
}

server.start();