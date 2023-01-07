import {connection} from "../database/database.js";

export async function postSignUp(req, res) {

    const {name, email, password, image} = res.locals;

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
export async function postSignIn(req, res) {

    const {token, user} = req.objSignIn;

    try {

        await connection.query(`
            INSERT INTO 
                session (token, "idUser")
            VALUES
                ($1, $2);
        `
        ,[token, user.id]);
        res.send({token, user}).status(200);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

}
export async function deleteLogOut(req, res){
    console.log("oi");
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    try {
        await connection.query(
          `
          DELETE FROM session
          WHERE token = $1
          `,
          [token]
        );
        res.sendStatus(200);
      } catch (e) {
        res.status(500).send(e);
      }

}