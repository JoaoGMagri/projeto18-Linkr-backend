import bcrypt from 'bcrypt';
import { connection } from "../database/database.js";
import joi from "joi";

export async function signUpMD(req, res, next) {

    const { name, email, password, image } = req.body;

    const signUpSchema = joi.object({
        email: joi.string().required(),
        password: joi.string().required(),
        name: joi.string().required(),
        image: joi.string().required()
    });
    
    const validation = signUpSchema.validate(req.body);
    if (validation.error) {
        return res.sendStatus(422);
    }

    try {

        const userExists = await connection.query(`SELECT * FROM users WHERE email=$1`, [email]);
        if (userExists.rowCount > 0) {
            res.sendStatus(409);
            return; 
        }
        const passwordCrypt = bcrypt.hashSync(password, 10);

        const objSignUP = {
            name,
            email,
            image,
            password: passwordCrypt
        }
        console.log(objSignUP);
        res.locals = objSignUP;

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

    next();

}