import { connection } from "../database/database";

async function addLike(id) {
  return connection.query(
    `
    UPDATE
      posts
    SET
      like: like + 1
    WHERE
      id:$1;
  `,
    [id]
  );
}
async function removeLike(id) {
  return connection.query(
    `
    UPDATE
      posts
    SET
      like: like - 1
    WHERE
      id:$1;
  `,
    [id]
  );
}
async function addPeopleWhoLiked({ idUser, idPost }) {
  return connection.query(
    `
    INSERT INTO
      "usersPosts" (
        "idUser",
        "idPost",
      )
    VALUES
      (
        $1,
        $2
      );
  `,
    [idUser, idPost]
  );
}
async function removePeopleWhoLiked({ idUser, idPost }) {
  return connection.query(
    `
    DELETE FROM
      "usersPosts" 
    WHERE
      "idUser"=$1
    AND
      "idPost"=$2;
  `,
    [idUser, idPost]
  );
}

export const postRepos = {
  addLike,
  removeLike,
  addPeopleWhoLiked,
  removePeopleWhoLiked,
};
