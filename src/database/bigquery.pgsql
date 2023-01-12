WITH cti AS (
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
    WHEN 17 = ANY (array_agg(followers."idFollower")) 
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
  COALESCE (
    array_agg (
      json_build_object (
        'id', wholiked.id,
        'user', wholiked.name
      )
    ) FILTER (where wholiked.name is not null), ARRAY[]::json[] 
  ) as likes,

  -- se eu estou na lista de quem curtiu esse post
  CASE WHEN 18 = ANY (array_agg(wholiked.id)) 
    THEN true
    ELSE false 
    END 
  as "userLiked",
  
  -- se eu estou na lista de seguidores do criador do post
  cte.follow,

  cti.count,

  -- se o post está na lista de posts repostados
  CASE WHEN posts.id = ANY (array_agg(reposts."idPost"))
    THEN whorepost.name
    ELSE null
    END 
  as reposts
  
FROM 
  posts

JOIN cte
ON cte.id = posts.id

JOIN cti
ON cti.id = posts.id

-- saber quem é o dono do post
LEFT JOIN
  users creator
ON
  posts."idUser" = creator.id

-- saber os likes de cada post
LEFT JOIN
  "usersPosts" likes
ON
  posts.id = likes."idPost"

-- saber quem é o dono do like no post
LEFT JOIN
  users wholiked
ON
  likes."idUser" = wholiked.id

-- saber quem segue o usuário da postagem
LEFT JOIN
  "usersUsers" followers
ON
  posts."idUser" = followers."idUser"

-- saber os posts repostados // "duplicados"
LEFT JOIN
  "postsPosts" reposts
ON
  posts.id = reposts."idPost"

-- saber quem é o "dono" do post repostado
LEFT JOIN
  users whorepost
ON
  reposts."idUser" = whorepost.id

WHERE 
  (
  cte.follow = true 
  OR 
  whorepost.id = 18
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
      whofollow."idFollower" = 18
    )
  )
GROUP BY
  posts.id,
  creator.name,
  creator.image,
  whorepost.name,
  cte.follow,
  reposts."createdAt"
ORDER BY
  posts.id DESC,
  reposts."createdAt" DESC
LIMIT 10;




-- first bQ --------------------------------------------------------------------





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
  END AS reposts
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
LEFT JOIN
  "postsPosts" pp
ON
  pp."idPost"=posts.id

LEFT JOIN
  "usersUsers" uu
ON
  uu."idUser" = pp."idUser"
WHERE ((
  CASE
    WHEN $1 = "usersUsers"."idFollower" 
      THEN 
        true
      ELSE
        false
    END
  OR 
  CASE
    WHEN $1 = "usersUsers"."idUser" 
      THEN 
        true
      ELSE
        false
    END
  ) OR (
    CASE
      WHEN $1 = "postsPosts"."idUser"
        THEN 
          true
        ELSE
          false
      END
    OR 
      CASE
        WHEN uu."idFollower" = $1
          THEN 
            true
          ELSE 
            false
        END
    AND users.id <> u2.id
  ))
GROUP BY 
  posts.id,
  users.name,
  users.image,
  u2.name,
  "postsPosts"."idUser",
  "postsPosts"."createdAt"
ORDER BY 
  posts.id DESC,
  "postsPosts"."createdAt" DESC;