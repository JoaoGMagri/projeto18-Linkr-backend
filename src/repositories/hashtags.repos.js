import { connection } from "../database/database.js";

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
      *
    FROM
      hashtags;
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
export const hashtagRepos = {
  insertHashtag,
  getAllHashtags,
  getPostsFromHashtag,
};
