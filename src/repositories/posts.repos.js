import { connection } from "../database/database.js";

async function insertPost({ url, text, idUser, createdAt }) {
  return connection.query(
    `
    INSERT INTO 
      "posts" (
        url,
        text,
        "idUser"
      )
    VALUES
      (
        $1, 
        $2, 
        $3
      );
    `,
    [url, text, idUser]
  );
}

async function listPost() {
  return connection.query(
    `
    SELECT posts.url, posts.text, posts."idUser", users.name, users.image
    FROM posts
    JOIN users ON posts."idUser" = users.id
    ORDER BY posts."idUser" DESC
    LIMIT 20;`
  );
}

async function addLike(id) {
  return connection.query(
    `
    UPDATE
      posts
    SET
      count: count + 1
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
      count: count - 1
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
  insertPost,
  listPost,
  addLike,
  removeLike,
  addPeopleWhoLiked,
  removePeopleWhoLiked,
};
