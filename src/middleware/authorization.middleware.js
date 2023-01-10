import { connection } from "../database/database.js";

export async function authorization(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  try {
    const userExist = await connection.query(
      `
      SELECT * FROM session
      WHERE token = $1
      `,
      [token]
    );

    if (userExist.rowCount === 0) {
      return res.sendStatus(401);
    }
    const user = await connection.query(
      `
        SELECT * FROM users
        WHERE id = $1;
        `,
      [userExist.rows[0].idUser]
    );

    delete user.rows[0].password;
    delete user.rows[0].email;

    res.locals.userExist = userExist;
  } catch (e) {
    res.status(500).send(e);
  }

  next();
}
