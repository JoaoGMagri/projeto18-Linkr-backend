import { connection } from "../database/database.js";

async function getAllPostsUsers({ idUser, id }) {
  return connection.query(
    `
    SELECT
      posts.id,
      posts.url,
      posts.text,
      posts."idUser" as "idCreator",
      u1.name as "createdBy",
      u1.image as "imageCreator",
      COALESCE (
        array_agg (
          json_build_object (
            'id', u2.id,
            'user', u3.name
          )
        ) FILTER (where u3.name is not null), ARRAY[]::json[] 
      ) as likes,
      CASE
        WHEN $1 = ANY (array_agg(u3.id)) THEN true
      ELSE
        false
      END AS "userLiked",
      CASE
        WHEN $1 = ANY (array_agg("usersUsers"."idFollower")) THEN true
      ELSE
        false
      END AS "follow",
      CASE
        WHEN posts.id = ANY (array_agg("postsPosts"."idPost")) THEN u4.name
      ELSE
        null
      END AS "reposts"
    FROM
      posts


    
    INNER JOIN
      users u1
    ON
      u1.id=posts."idUser"
    LEFT JOIN 
      users u2
    ON 
      posts."idUser" = u2.id
    LEFT JOIN 
      "usersPosts" likes
    ON 
      likes."idPost" = posts.id
    LEFT JOIN 
      users u3
    ON 
      likes."idUser" = u3.id

    LEFT JOIN 
      "usersUsers" 
    ON 
      posts."idUser" = "usersUsers"."idUser"
    LEFT JOIN 
      "postsPosts" 
    ON 
      posts."id" = "postsPosts"."idPost"  
    LEFT JOIN 
      "users" u4 
    ON 
      u4."id" = "postsPosts"."idUser"

    WHERE
      u1.id=$2
    GROUP BY 
      posts.id,
      u1.name,
      u1.image,
      u2.name,
      u4.name
    ORDER BY
      posts.id DESC;
  `,
    [idUser, id]
  );
}
async function getAllUser(idUser) {
  return connection.query(
    `
    SELECT
      users.id,
      users.name,
      users.image,
      CASE
        WHEN $1 = ANY (array_agg(uu."idFollower")) 
          THEN true
          ELSE false
        END as follow
    FROM
      users
    LEFT JOIN
      "usersUsers" uu
    ON
      uu."idUser" = users.id
    WHERE
      users.id<>$1
    GROUP BY
      users.id
    ORDER BY
      follow DESC;
  `,
    [idUser]
  );
}
async function getUser(id) {
  return connection.query(
    `
    SELECT
      *
    FROM
      users
    WHERE
      id=$1;
`,
    [id]
  );
}

export const usersRepos = {
  getUser,
  getAllUser,
  getAllPostsUsers,
};
