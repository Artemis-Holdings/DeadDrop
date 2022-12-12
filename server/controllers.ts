import { Request, Response } from 'express';
import { Service } from './service';

const service = new Service();

// Controlers manage data and logic.
export class Controllers {
  // static availabilityTest(req: Request, res: Response): string{
  //     console.log("availablity requested.");
  //     return "Dead-Drop Oneline";
  // }

  async asyncValidation(): Promise<string> {
    let timeoutId;
    try {
      const result: string | PromiseLike<string> = new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          resolve('Dead Drop Oneline');
        }, 10);
      });

      return await result;
    } catch (error) {
      timeoutId && clearTimeout(timeoutId);
      console.log('DeadDrop: Error with async request.');
      console.error(error);
      return 'Error';
    }
  }

  async migrate(): Promise<void> {
    try {
      await service.migrate();
    } catch (error) {
      console.log('DeadDrop: Migration Error.');
      console.error(error);
    }
  }

  async drop(): Promise<void> {
    try {
      await service.drop();
    } catch (error) {
      console.log('DeadDrop: Migration Error.');
      console.error(error);
    }
  }
}
