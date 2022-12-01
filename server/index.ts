// Routes are handled here in the index file. Do not handle returns or anything of that sort.

import { Server } from './app';
import { Request, Response } from 'express';

import { Controllers } from './controllers';

enum REST {
    GET = 'get',
    PUT = 'put',
    POST = 'post',
    PATCH = 'patch',
    DELETE = 'delete',
}

const server = new Server();

interface RouteConfigProps {
    method: REST;
    path: string;
}

// function routeConfig({method, path}: RouteConfigProps): MethodDecorator {
//     return function (
//         target: Object,
//         propertyKey: string | symbol,
//         descriptor: PropertyDescriptor
//     ) {
//         const response = (req: Request, res: Response) => {
//             const original = descriptor.value(req, res);

//             res.status(200).json(original);
//         }

//         server.app[method](path, response);
//     }
// }
function routeConfig({method, path}: RouteConfigProps): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const response = async (req: Request, res: Response) => {
            try {
                const original = await descriptor.value(req, res);

                res.status(200).json(original);
            } catch (e: any) {
                res.status(500).json({
                    message: "Some error occurred",
                    error: e.message,
                    stack: e.stack,
                });
            }
        }

        server.app[method](path, response);
    }
}

// Use the routeConfig decorator to establish the route, then use a public method to return the response from the controller to the user.
/* BASIC PATTERN FOR ROUTES
    @routeConfig({
        method: REST.GET, // or PUT or POST or DELETE. See enum REST
        path: "/path/to/nowhere" //the URL
    })
    public changeMe(req: Request, res: Response){
        return Controller.staticMethodFromControler(req, res)
    }
 */
class Routes {
    @routeConfig({
        method: REST.GET,
        path: "/"
    })
    public root(req: Request, res: Response) {
        return Controllers.availabilityTest(req, res);
    }




    @routeConfig({
        method: REST.POST,
        path: "/async"
    })
    public async asyncTest(req: Request, res: Response) {
        // let timeoutId;
        // try {
        //     const result = new Promise((resolve) => {
        //         timeoutId = setTimeout(() => {
        //             resolve("After 2 seconds");
        //         }, 2000)
        //     });

        //     return await result;
        // } catch (error) {
        //     timeoutId && clearTimeout(timeoutId);
        //     return "Some error message";
        // }
        return Controllers.asyncTest(req, res);
    }
        

}


server.start();