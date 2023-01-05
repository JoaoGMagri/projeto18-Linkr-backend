import { hashtagRepos } from "../repositories/hashtags.repos.js";
import { postRepos } from "../repositories/posts.repos.js";
import urlMetadata from "url-metadata";

async function publishPost(req, res) {
  const { text, url } = req.body;
  const userData = res.locals.userExist;
  const idUser = userData.rows[0].idUser;
  try {
    const urlmetadata = await urlMetadata(url);
    let response;
    let body = { text, url, idUser };

    if (urlmetadata.title === null) {
      response = {
        ...body,
        urlTitle: "Cannot load title information",
        urlImage: "https://cdn-icons-png.flaticon.com/512/3097/3097257.png",
        urlDescription: "Cannot load description information",
      };
    } else {
      response = {
        ...body,
        urlTitle: urlmetadata.title,
        urlImage: urlmetadata.image,
        urlDescription: urlmetadata.description,
      };
    }
    await postRepos.insertPost(body);

    return res.status(201).send(body);
  } catch (e) {
    return res.status(500).send(e);
  }
}

async function listPosts(req, res) {
  try {
    const result = await postRepos.listPost();

    return res.status(200).send(result.rows);
  } catch (e) {
    return res.status(500).send(e);
  }
}

async function like(req, res) {
  const { idPost: id } = req.params;
  const { rows: user } = res.locals.userExist;
  try {
    const postLike = await postRepos.addLike(id);

    if (postLike.rowCount === 0) {
      return res.sendStatus(400);
    }

    await postRepos.addPeopleWhoLiked({
      idUser: user[0].id,
      idPost: id,
    });

    return res.sendStatus(201);
  } catch (e) {
    return res.status(500).send();
  }
}
async function dislike(req, res) {
  const { idPost: id } = req.params;
  const { rows: user } = res.locals.userExist;
  try {
    const postDislike = await postRepos.removeLike(id);

    if (postDislike.rowCount === 0) {
      return res.sendStatus(400);
    }

    await postRepos.removePeopleWhoLiked({
      idUser: user[0].id,
      idPost: id,
    });

    return res.sendStatus(201);
  } catch (e) {
    return res.status(500).send();
  }
}
async function viewByHashtag(req, res) {
  const { hashtag } = req.params;
  try {
    const posts = await hashtagRepos.getPostsFromHashtag(hashtag);

    return res.status(200).send({ posts });
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export const postControllers = {
  publishPost,
  listPosts,
  like,
  dislike,
  viewByHashtag,
};
