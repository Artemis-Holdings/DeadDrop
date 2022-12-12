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

interface IRouteConfigProps {
  method: REST;
  path: string;
}

const server = new Server();
const controller = new Controllers();

function routeConfig({ method, path }: IRouteConfigProps): MethodDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const response = async (req: Request, res: Response) => {
      try {
        const original = await descriptor.value(req, res);

        res.status(200).json(original);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        res.status(500).json({
          message: 'Some error occurred',
          error: error.message,
          stack: error.stack,
        });
      }
    };
    // eslint-disable-next-line security/detect-object-injection
    server.app[method](path, response);
  };
}

// Use the routeConfig decorator to establish the route, then use a public
// method to return the response from the controller to the user.
/* BASIC PATTERN FOR ROUTES
    @routeConfig({
        method: REST.GET, // or PUT or POST or DELETE. See enum REST
        path: "/path/to/nowhere" //the URL
    })
    public changeMe(req: Request, res: Response){
        return Controller.staticMethodFromControler(req, res)
    }
 */
export class Routes {
  @routeConfig({
    method: REST.GET,
    path: '/',
  })
  public async root() {
    return controller.asyncValidation();
  }

  @routeConfig({
    method: REST.POST,
    path: '/migrate',
  })
  public async migrate() {
    return controller.migrate();
  }

  // TODO: Remove this route before production.
  @routeConfig({
    method: REST.DELETE,
    path: '/drop',
  })
  public async drop() {
    return controller.drop();
  }
}

server.start();
