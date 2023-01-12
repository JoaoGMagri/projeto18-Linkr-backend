import { hashtagRepos } from "../repositories/hashtags.repos.js";
import { postRepos } from "../repositories/posts.repos.js";
import urlMetadata from "url-metadata";
import { usersRepos } from "../repositories/users.repos.js";

async function publishPost(req, res) {
  const { text, url, hashtags } = req.body;
  const { rows: user } = res.locals.userExist;

  const idUser = user[0].idUser;
  try {
    const body = { text, url, idUser };

    const { rows: post } = await postRepos.insertPost(body);

    await postRepos.insertRepost({
      idUser,
      idPost: post[0].id,
    });

    if (!!hashtags.length) {
      hashtags.forEach(async (tag) => {
        const findTag = await hashtagRepos.findHashtag(tag);
        let id = findTag.rows[0].id;
        if (findTag.rowCount === 0) {
          const { rows: tag } = await hashtagRepos.insertHashtag(tag);
          id = tag[0].id;
        }
        await hashtagRepos.addUsedHashtag({
          idHashtag: id,
          idPost: post[0].id,
        });
      });
    }

    return res.status(201).send(body);
  } catch (e) {
    return res.status(500).send(e);
  }
}
async function listPosts(req, res) {
  const { page } = req.query;
  const { rows: user } = res.locals.userExist;

  const idUser = user[0].idUser;
  let offsetPages;

  switch (page) {
    case "1":
    case undefined:
      offsetPages = 0;
      break;
    default:
      offsetPages = (page - 1) * 10;
      break;
  }
  try {
    const { rows: posts } = await postRepos.listPost(idUser, offsetPages);
    const { rows: hashtags } = await hashtagRepos.getAllHashtags();
    const { rows: users } = await usersRepos.getAllUser(idUser);

    console.log(users);
    // const { rows: postData } = await getPostsUrl(posts);
    const result = {
      posts,
      hashtags,
      users,
    };
    return res.status(200).send(result);
  } catch (e) {
    console.log(e.message);
    return res.status(500).send(e.message);
  }
}
async function getData(req, res) {
  const { link } = req.body;
  let data = {};
  try {
    await urlMetadata(link).then(function (metadata) {
      data.urlImage =
        metadata.image === ""
          ? "https://static.vecteezy.com/ti/vetor-gratis/t2/7126739-icone-de-ponto-de-interrogacao-gratis-vetor.jpg"
          : metadata.image;

      data.urlTitle =
        metadata.title === null
          ? "Cannot load title information"
          : metadata.title;

      data.urlDescription =
        metadata.description === ""
          ? "Cannot load description information"
          : metadata.description;
    });
    return res.send(data);
  } catch (error) {
    return res.sendStatus(500);
  }
}
async function like(req, res) {
  const { idPost: id } = req.params;
  const { rows: user } = res.locals.userExist;
  try {
    const postToLike = await postRepos.searchIdPost(id);

    if (postToLike.rowCount === 0) {
      return res.sendStatus(400);
    }

    console.log("user ", user[0].idUser);
    console.log("post ", id);

    await postRepos.addPeopleWhoLiked({
      idUser: user[0].idUser,
      idPost: id,
    });
    console.log("passou aqui, like");

    return res.sendStatus(201);
  } catch (e) {
    return res.status(500).send(e.message);
  }
}
async function dislike(req, res) {
  const { idPost: id } = req.params;
  const { rows: user } = res.locals.userExist;
  try {
    console.log("passou aqui, dislike");
    const postToDislike = await postRepos.searchIdPost(id);

    if (postToDislike.rowCount === 0) {
      return res.sendStatus(400);
    }

    await postRepos.removePeopleWhoLiked({
      idUser: user[0].idUser,
      idPost: id,
    });

    return res.sendStatus(201);
  } catch (e) {
    return res.status(500).send(e);
  }
}
async function viewByHashtag(req, res) {
  const { page } = req.query;
  const { hashtag } = req.params;
  const { rows: user } = res.locals.userExist;

  const idUser = user[0].idUser;
  let offsetPages;

  switch (page) {
    case "1":
    case undefined:
      offsetPages = 0;
      break;
    default:
      offsetPages = (page - 1) * 10;
      break;
  }
  try {
    const { rows: posts } = await hashtagRepos.getPostsFromHashtag({
      idUser,
      hashtag,
      offset: offsetPages,
    });
    const { rows: hashtags } = await hashtagRepos.getAllHashtags();

    const { rows: users } = await usersRepos.getAllUser(idUser);

    return res.status(200).send({ posts, hashtags, users });
  } catch (error) {
    return res.status(500).send(error.message);
  }
}
async function deletePost(req, res) {
  const { idPost: id } = req.params;
  try {
    await postRepos.deletePostUser(id);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).send(error);
  }
}
async function viewLikesByPost(req, res) {
  const { id: idPost } = req.params;
  const { rows: user } = res.locals.userExist;

  const idUser = user[0].idUser;
  try {
    const { rows: result } = await postRepos.getLikedBy({ idUser, idPost });
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
}
async function updatePost(req, res) {
  const { idPost } = req.params;
  const { data } = req.body;

  try {
    await postRepos.updatePostUser({ idPost, data });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send(error);
  }
}
async function refresh(req, res) {
  const { id } = req.body;
  const { rows: user } = res.locals.userExist;

  const idUser = user[0].idUser;
  try {
    const { rows: posts } = await postRepos.verifyMostRecentPost(idUser, id);
    return res.status(200).send(posts);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export const postControllers = {
  publishPost,
  listPosts,
  like,
  dislike,
  deletePost,
  viewByHashtag,
  viewLikesByPost,
  getData,
  updatePost,
  refresh,
};
