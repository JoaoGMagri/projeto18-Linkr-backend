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
      posts.id,
      posts.url,
      posts.text,
      posts."idUser",
      users.name as username,
      users.image,
      COALESCE (
        array_agg (
          json_build_object (
            'id', users.id,
            'user', u.name
          )
        ) FILTER (where u.name is not null), ARRAY[]::json[] 
      ) as likes,
      CASE
        WHEN $1 = ANY (array_agg(u.id)) THEN true
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
    GROUP BY 
      posts.id,
      users.name,
      users.image
    ORDER BY 
      posts.id DESC
    LIMIT 20;
    `,
    [idUser]
  );
}
async function addPeopleWhoLiked({ idUser, idPost }) {
  return connection.query(
    `
    INSERT INTO
      "usersPosts" (
        "idUser",
        "idPost"
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
async function getLikedBy({ idUser, idPost }) {
  return connection.query(
    `
    SELECT
    COALESCE (
      array_agg (
        json_build_object (
          'id', users.id,
          'user', u.name
        )
      ) FILTER (where u.name is not null), ARRAY[]::json[] 
    ) as likes,
    CASE
      WHEN $1 = ANY (array_agg(u.id)) THEN true
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
    WHERE
      posts.id=$2
    GROUP BY 
      users.name,
      users.image
    LIMIT 20;
  `,
    [idUser, idPost]
  );
}
export const postRepos = {
  insertPost,
  listPost,
  getLikedBy,
  addPeopleWhoLiked,
  removePeopleWhoLiked,
  deletePostUser,
  searchIdPost,
  searchPostByUser,
};
