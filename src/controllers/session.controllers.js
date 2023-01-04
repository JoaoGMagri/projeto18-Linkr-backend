import {connection} from "../database/database.js";

export async function postSingUp(req, res) {

    const {name, email, password, image} = req.objSingUP;

    try {

        await connection.query(`
            INSERT INTO 
                users (name, email, password, image)
            VALUES
                ($1, $2, $3, $4);
        `,
        [name, email, password, image]);
        res.sendStatus(201);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

}

export async function postSingIn(req, res) {

    const {token, userId} = req.objSingIn;

    try {

        await connection.query(`
            INSERT INTO 
                session (token, "idUser")
            VALUES
                ($1, $2);
        `
        ,[token, userId]);
        res.send(token).status(200);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

}