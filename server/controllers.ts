import { Request, Response } from 'express';

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
      return 'Error';
    }
  }
}
