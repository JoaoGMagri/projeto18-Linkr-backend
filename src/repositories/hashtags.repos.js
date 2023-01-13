import { connection } from "../database/database.js";

async function findHashtag(name) {
  return connection.query(
    `
    SELECT
      *
    FROM
      hashtags
    WHERE
      name=$1;
  `,
    [name]
  );
}
async function insertHashtag(name) {
  return connection.query(
    `
    INSERT INTO
      hashtags (
        name
      )
    VALUES ($1)
    RETUNNING id;
  `,
    [name]
  );
}
async function getAllHashtags() {
  return connection.query(`
    SELECT
      hashtags.name
    FROM
      "hashtagsPosts"
    INNER JOIN
      hashtags
    ON
      hashtags.id="hashtagsPosts"."idHashtag"
    GROUP BY
      hashtags.name
    ORDER BY
      COUNT("hashtagsPosts"."idPost") DESC
    LIMIT
      10;
  `);
}
async function getPostsFromHashtag({ idUser, hashtag, offset }) {
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
      "hashtagsPosts" trending
    ON
      posts.id = trending."idPost"
    INNER JOIN
      hashtags tag
    ON
      trending."idHashtag" = tag.id
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
      tag.name = $2
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
    [idUser, hashtag, offset]
  );
}
async function addUsedHashtag({ idHashtag, idPost }) {
  return connection.query(
    `
    INSERT INTO
      "hashtagsPosts" (
        "idHashtag",
        "idPost"
      )
    VALUES ($1, $2);
  `,
    [idHashtag, idPost]
  );
}
export const hashtagRepos = {
  findHashtag,
  insertHashtag,
  getAllHashtags,
  getPostsFromHashtag,
  addUsedHashtag,
};
