import { connection } from "../database/database.js";

async function insertPost({ url, text, idUser }) {
  console.log(idUser);
  return connection.query(
    `
    INSERT INTO 
      posts (
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
async function listPost(idUser) {
  return connection.query(
    `
    SELECT
      posts.url,
      posts.text,
      posts."idUser",
      users.name as username,
      users.image,
      COALESCE (
        array_agg (
          json_build_object (
            'id', likes."idUser",
            'user', u.name
          )
        ) FILTER (where likes."idUser" is not null), ARRAY[]::json[] 
      ) as likes,
      CASE
        WHEN up2."idUser"=$1 THEN true
      ELSE
        false
      END AS "userLiked"
    FROM 
      posts
    LEFT JOIN 
      users 
    ON 
      posts."idUser" = users.id
    LEFT JOIN 
      "usersPosts" likes
    ON 
      likes."idPost" = posts.id
    LEFT JOIN 
      users u
    ON 
      likes."idUser" = u.id
    LEFT JOIN 
      "usersPosts" up2
    ON 
      up2."idPost" = posts.id
    LEFT JOIN 
      users u2
    ON 
      up2."idUser" = u2.id
    GROUP BY 
      posts.id,
      users.name,
      users.image,
      up2."idUser"
    ORDER BY 
      posts.id DESC
    LIMIT 20;
    `,
    [idUser]
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

async function searchIdPost(idPost) {
  return connection.query(
    `
      SELECT * FROM
        posts
      WHERE
        id=$1
    `,
    [idPost]
  );
}
async function searchPostByUser({ text, url, idUser }) {
  return connection.query(
    `
    SELECT * FROM
      posts
    WHERE
      url=$2
    AND
      text=$1
    AND
      "idUser"=$3
    ORDER BY
      "id" DESC;
    `,
    [text, url, idUser]
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
  searchIdPost,
  searchPostByUser,
};
