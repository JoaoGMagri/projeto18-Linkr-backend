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
  creator.id = 18
  OR
  whorepost.id = 18
  )
GROUP BY
  posts.id,
  creator.name,
  creator.image,
  whorepost.name,
  cte.follow,
  cti.count,
  reposts."createdAt"
ORDER BY
  posts.id DESC,
  reposts."createdAt" DESC
LIMIT 10 OFFSET 0;