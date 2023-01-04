import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import joi from "joi";

import {connection} from "../database/database.js";

export async function singInMD(req, res, next) {

    const { email, password } = req.body;
    const token = uuidv4();

    const signInSchema = joi.object({
        email: joi.string().required(),
        password: joi.string().required()
    });

    const validation = signInSchema.validate(req.body);
    if (validation.error) {
        return res.sendStatus(422);
    }

    try {
        
        const userExists = await connection.query(`SELECT * FROM users WHERE email=$1`, [email]);
        if (userExists.rowCount === 0) {
            return res.sendStatus(401);
        }

        const passwordOK = bcrypt.compareSync(password, userExists.rows[0].password);
        if (!passwordOK) {
            return res.sendStatus(401);
        }

        const userSession = await connection.query(`SELECT * FROM session WHERE "idUser"=$1`, [userExists.rows[0].id]);
        if (userSession.rowCount !== 0) {
            return res.send(userSession.rows[0].token);
        }

        const objSingIn = { 
            token, 
            userId: userExists.rows[0].id 
        }
        req.objSingIn = objSingIn;

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

    next();

}