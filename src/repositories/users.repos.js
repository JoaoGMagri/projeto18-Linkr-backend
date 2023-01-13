import { connection } from "../database/database.js";

async function getAllPostsUsers({ idUser, id, offset }) {
  return connection.query(
    `
    WITH cto AS (
      SELECT 
        posts.id,
        COALESCE (
          array_agg ( 
            DISTINCT jsonb_build_object (
              'id', likes."idUser",
              'user', wholiked.name
            )
          ) FILTER (where wholiked.name is not null),
          ARRAY[]::JSONB[]) as likes
      FROM
        posts
      LEFT JOIN
        "usersPosts" likes
      ON
        posts.id = likes."idPost"
      LEFT JOIN
        users wholiked
      ON
        likes."idUser" = wholiked.id
      GROUP BY
        posts.id
    ),
    cti AS (
      SELECT
        posts.id,
        COUNT(reposts."idPost") as count
      FROM
        posts
      LEFT JOIN
        "postsPosts" reposts
      ON
        posts.id = reposts."idPost"
      GROUP BY
        posts.id
    ),
    cte AS (
      SELECT
        posts.id,
        CASE 
        WHEN $1 = ANY (array_agg(followers."idFollower")) 
          THEN true
          ELSE false
        END as follow
      FROM
        posts
      LEFT JOIN
        "usersUsers" followers
      ON
        posts."idUser" = followers."idUser"
      GROUP BY
        posts.id
    )
    SELECT
      posts.id,
      posts.url,
      posts.text,
      posts."idUser" as "idCreator",
      creator.name as "createdBy",
      creator.image as "imageCreator",
      CASE WHEN $1 = ANY (array_agg(wholiked.id)) 
        THEN true
        ELSE false 
        END 
      as "userLiked",
      cte.follow,
      cti.count,
      cto.likes,
      CASE WHEN posts.id = ANY (array_agg(reposts."idPost"))
        THEN whorepost.name
        ELSE null
        END 
      as reposts
    FROM 
      posts
    JOIN cte ON cte.id = posts.id
    JOIN cti ON cti.id = posts.id
    JOIN cto ON cto.id = posts.id
    LEFT JOIN
      users creator
    ON
      posts."idUser" = creator.id
    LEFT JOIN
      "usersPosts" likes
    ON
      posts.id = likes."idPost"
    LEFT JOIN
      users wholiked
    ON
      likes."idUser" = wholiked.id
    LEFT JOIN
      "usersUsers" followers
    ON
      posts."idUser" = followers."idUser"
    LEFT JOIN
      "postsPosts" reposts
    ON
      posts.id = reposts."idPost"
    LEFT JOIN
      users whorepost
    ON
      reposts."idUser" = whorepost.id
    WHERE 
      (
      creator.id = $2
      OR
      whorepost.id = $2
      )
    GROUP BY
      posts.id,
      creator.name,
      creator.image,
      whorepost.name,
      cte.follow,
      cti.count,
      cto.likes,
      reposts."createdAt"
    ORDER BY
      posts.id DESC,
      reposts."createdAt" DESC
    LIMIT 10 OFFSET $3;
  `,
    [idUser, id, offset]
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

async function getFollow(id, idUsers) {
  return connection.query(
    `
      SELECT
      "usersUsers".id
      FROM
        "usersUsers"
      WHERE
        "idUser"=$1 AND "idFollower"=$2
      GROUP BY
        "usersUsers".id;
    `,
    [id, idUsers]
  );
}

async function createFollow(id, idUsers) {
  return connection.query(
    `
      INSERT INTO
        "usersUsers"("idUser", "idFollower")
      VALUES
        ($1, $2)
      RETURNING id;
    `,
    [id, idUsers]
  );
}

async function deleteFollow(id) {
  connection.query(
    `
      DELETE FROM
        "usersUsers"
      WHERE
        id = $1;
    `,
    [id]
  );
}
export const usersRepos = {
  getUser,
  getAllUser,
  getAllPostsUsers,
  getFollow,
  createFollow,
  deleteFollow,
};
