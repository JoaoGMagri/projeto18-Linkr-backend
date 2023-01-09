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
async function getPostsFromHashtag(name) {
  return connection.query(
    `
    SELECT
      posts.*
    FROM
      posts
    INNER JOIN
      "hashtagsPosts"
    ON
      posts.id="hashtagsPosts"."idPost"
    INNER JOIN
      "hashtags"
    ON
      hashtags.id="hashtagsPosts"."idHashtag"
    WHERE
      hashtags.name=$1;
  `,
    [name]
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
