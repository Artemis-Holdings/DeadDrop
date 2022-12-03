import { Request, Response } from 'express';
import { Service } from './service';

// Controlers manage data and logic.
export class Controllers {
  // static availabilityTest(req: Request, res: Response): string{
  //     console.log("availablity requested.");
  //     return "Dead-Drop Oneline";
  // }

  static async asyncValidation(): Promise<string> {
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

  static async migrate(): Promise<string> {
    try {
      return await Service.migrate();
    } catch (error) {
      console.log('DeadDrop: Migration Error.');
      console.error(error);
      return 'Error';
    }
  }
}
