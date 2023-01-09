import { connection } from "../database/database.js";

async function getAllPostsUsers({ idUser, id }) {
  return connection.query(
    `
    SELECT
      posts.*,
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
      END AS "userLiked"
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
    WHERE
      u1.id=$2
    GROUP BY 
      posts.id;
  `,
    [idUser, id]
  );
}
async function getAllUser() {
  return connection.query(`
    SELECT
      *
    FROM
      users;
  `);
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
