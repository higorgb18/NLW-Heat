import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayLoad {

    sub: string

}

export function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {

    const authToken = request.headers.authorization;

    if(!authToken) {

        return response.status(401).json({

            errorCode: "token.invalid",

        });

    }

    // [bearer, token]
    // [0] bearer
    // [1] token

    const [,token] = authToken.split(" ") // [vazio, token]

    try {

        const { sub } = verify(token, process.env.JWT_SECRET) as IPayLoad

        request.user_id = sub;

        return next();

    } catch(error) {

        return response.status(401).json({ errorCode: "token.expired" })

    }


}