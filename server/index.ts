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

interface RouteConfigProps {
  method: REST;
  path: string;
}

const server = new Server();
function routeConfig({ method, path }: RouteConfigProps): MethodDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const response = async (req: Request, res: Response) => {
      try {
        const original = await descriptor.value(req, res);

        res.status(200).json(original);
      } catch (e: any) {
        res.status(500).json({
          message: 'Some error occurred',
          error: e.message,
          stack: e.stack,
        });
      }
    };

    server.app[method](path, response);
  };
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
    path: '/',
  })
  public async root() {
    return Controllers.asyncValidation();
  }
}

server.start();
