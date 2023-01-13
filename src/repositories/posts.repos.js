import { connection } from "../database/database.js";

async function insertPost({ url, text, idUser }) {
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
      ) 
    RETURNING id;
    `,
    [url, text, idUser]
  );
}
async function insertRepost({ idUser, idPost }) {
  return connection.query(
    `
    INSERT INTO 
      "postsPosts" (
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
async function listPost(idUser) {
  return connection.query(
    `
    SELECT
      posts.id,
      posts.url,
      posts.text,
      posts."idUser" as "idCreator",
      users.name as "createdBy",
      users.image as "imageCreator",
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
      END AS "userLiked",
      CASE
        WHEN $1 = ANY (array_agg("usersUsers"."idFollower")) THEN true
      ELSE
        false
      END AS "follow",
      CASE
        WHEN posts.id = ANY (array_agg("postsPosts"."idPost")) THEN u2.name
      ELSE
        null
      END AS "reposts"    
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
      "usersUsers" 
    ON 
      posts."idUser" = "usersUsers"."idUser"
    LEFT JOIN 
      "postsPosts" 
    ON 
      posts."id" = "postsPosts"."idPost"  
    LEFT JOIN 
      "users" u2 
    ON 
      u2."id" = "postsPosts"."idUser"
    WHERE ((
      CASE
        WHEN $1 = "usersUsers"."idFollower" 
          THEN 
            true
          ELSE
            false
        END
    ) OR (
      CASE
        WHEN $1 = "usersUsers"."idUser" 
          THEN 
            true
          ELSE
            false
        END
    ))
    GROUP BY 
      posts.id,
      users.name,
      users.image,
      "postsPosts"."idUser",
      u2.name,
      "postsPosts"."createdAt"
    ORDER BY 
      posts.id DESC,
      "postsPosts"."createdAt" DESC
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

async function deletePostsPostsUser(idPost) {
  return connection.query(
    `
    DELETE FROM 
      "postsPosts" 
    WHERE 
      "idPost"=$1;
    `,
    [idPost]
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

async function updatePostUser({ idPost, data }) {
  console.log(idPost, data);
  return connection.query(
    `
      UPDATE 
        posts 
      SET
        text=$1
      WHERE
        id=$2;
    `,
    [data, idPost]
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
  updatePostUser,
  insertRepost,
  deletePostsPostsUser,
};
