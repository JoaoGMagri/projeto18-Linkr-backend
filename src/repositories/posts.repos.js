import { connection } from "../database/database.js";

async function insertPost({
  //userId,
  text,
  url,
  urlTitle,
  urlImage,
  urlDescription,
}) {
  return connection.query(
    `
    INSERT INTO posts 
    (text, url, "urlTitle", "urlImage", "urlDescription") 
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [id, text, url, urlTitle, urlImage, urlDescription]
  );
}

async function listPost() {
  return connection.query(
    `
    SELECT posts.text, 
    posts.url,
    posts.likes,
    users.name,
    users.image
    FROM posts
    JOIN users ON posts."userId" = users.id
    LIMIT 20;
    `
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

async function deletePostUser(idPost) {
  return connection.query(
    `
      DELETE FROM 
        posts
      WHERE
        id = $1;
    `,
    [idPost]
  );
}

export const postRepos = {
  insertPost,
  listPost,
  addLike,
  removeLike,
  addPeopleWhoLiked,
  removePeopleWhoLiked,
  deletePostUser,
};
