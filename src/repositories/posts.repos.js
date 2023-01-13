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
async function listPost(idUser, offset) {
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
          ARRAY[]::JSONB[]) as likes,
        COALESCE (
          array_agg ( 
            DISTINCT jsonb_build_object (
              'id', whocomment.id,
              'user', whocomment.name,
              'image', whocomment.image,
              'comment', comments.comment
            )
          ) FILTER (where whocomment.name is not null),
          ARRAY[]::JSONB[]) as comments
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
      LEFT JOIN
        comments
      ON
        posts.id = comments."postComment"
      LEFT JOIN
        users whocomment
      ON
        comments."idUserComment" = whocomment.id
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
      posts."createdAt",
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
      cto.comments,
      CASE WHEN posts.id = ANY (array_agg(reposts."idPost"))
        THEN whorepost.name
        ELSE null
        END 
      as "repostsName",
      CASE WHEN posts.id = ANY (array_agg(reposts."idPost"))
        THEN whorepost.id
        ELSE null
        END 
      as "repostsId" 
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
      cte.follow = true 
      OR 
      whorepost.id = $1
      OR 
      whorepost.id IN (
        SELECT 
          whofollow."idUser"
        FROM
          "postsPosts" reposts
        LEFT JOIN
          "usersUsers" whofollow
        ON
          reposts."idUser" = whofollow."idUser"
        WHERE
          whofollow."idFollower" = $1
        )
      )
    GROUP BY
      posts.id,
      creator.name,
      creator.image,
      whorepost.name,
      cte.follow,
      cti.count,
      cto.likes,
      cto.comments,
      reposts."createdAt",
      whorepost.id
    ORDER BY
      posts.id DESC,
      reposts."createdAt" DESC
    LIMIT 10 OFFSET $2;
    `,
    [idUser, offset]
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
async function verifyMostRecentPost(idUser, id) {
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
      posts."createdAt",
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
      (cte.follow = true 
      OR 
      whorepost.id = $1
      OR 
      whorepost.id IN (
        SELECT 
          whofollow."idUser"
        FROM
          "postsPosts" reposts
        LEFT JOIN
          "usersUsers" whofollow
        ON
          reposts."idUser" = whofollow."idUser"
        WHERE
          whofollow."idFollower" = $1
        ))
      AND (
       posts.id > $2
      OR
       reposts."idPost" > $2
      ))
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
    LIMIT 10;
    `,
    [idUser, id]
  );
}
async function postRepost(idUser, id) {
  console.log(idUser, id);
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
        ) 
    RETURNING id;
    `,
    [idUser, id]
  );
}

async function commentInPost(idPost, comment, idUser) {
  return connection.query(
    `
    INSERT INTO 
      comments
      ("idUserComment", "postComment", comment)
    VALUES
      ($1, $2, $3);      
  `,
    [idUser, idPost, comment]
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
  verifyMostRecentPost,
  commentInPost,
  postRepost,
};
