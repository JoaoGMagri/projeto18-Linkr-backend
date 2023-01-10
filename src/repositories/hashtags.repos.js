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
    VALUES ($1);
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
async function getPostsFromHashtag({ idUser, hashtag }) {
  return connection.query(
    `
    SELECT
      posts.*,
      users.name,
      users.image,
      users.id,
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
    INNER JOIN
      "hashtagsPosts"
    ON
      posts.id="hashtagsPosts"."idPost"
    INNER JOIN
      hashtags
    ON
      hashtags.id="hashtagsPosts"."idHashtag"
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
      hashtags.name=$2
    GROUP BY 
      posts.id;
  `,
    [idUser, hashtag]
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
