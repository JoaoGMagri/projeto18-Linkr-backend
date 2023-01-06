import { hashtagRepos } from "../repositories/hashtags.repos.js";
import { postRepos } from "../repositories/posts.repos.js";

async function publishPost(req, res) {
  const { text, url, hashtags } = req.body;
  const { rows: user } = res.locals.userExist;

  const idUser = user[0].idUser;
  try {
    const body = { text, url, idUser };

    if (!!hashtags.length) {
      hashtags.forEach(async (tag) => {
        const findTag = await hashtagRepos.findHashtag(tag);
        if (findTag.rowCount === 0) await hashtagRepos.insertHashtag(tag);
      });
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

async function deletePost(req, res) {
  const { idPost: id } = req.params;
  try {
    await postRepos.deletePostUser(id);
    console.log("Tá no controller");
    return res.sendStatus(200);
  } catch (e) {
    return res.sendStatus(500);
  }
}

export const postControllers = {
  publishPost,
  listPosts,
  like,
  dislike,
  deletePost,
  viewByHashtag,
};
