import { Request, Response } from "express";


// Controlers manage data and logic.
export class Controllers {

    static availabilityTest(req: Request, res: Response): string{
        console.log("availablity requested.");
        return "Dead-Drop Available";
    }


    static async asyncTest(req: Request, res: Response): Promise<String> {
        let timeoutId;
        try {
            const result: String | PromiseLike<String> = new Promise((resolve) => {
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