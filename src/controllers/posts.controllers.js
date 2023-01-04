import { hashtagRepos } from "../repositories/hashtags.repos.js";
import { postRepos } from "../repositories/posts.repos.js";

async function like(req, res) {
  const { idPost: id } = req.params;
  try {
    const postLike = await postRepos.addLike(id);

    if (postLike.rowCount === 0) {
      return res.sendStatus(400);
    }

    await postRepos.addPeopleWhoLiked({
      idUser: postLike[0].id,
      idPost: id,
    });

    return res.sendStatus(201);
  } catch (e) {
    return res.status(500).send();
  }
}
async function dislike(req, res) {
  const { idPost: id } = req.params;
  try {
    const postDislike = await postRepos.removeLike(id);

    if (postDislike.rowCount === 0) {
      return res.sendStatus(400);
    }

    await postRepos.removePeopleWhoLiked({
      idUser: postDislike[0].id,
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
  like,
  dislike,
  viewByHashtag,
};
