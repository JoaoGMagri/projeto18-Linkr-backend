import { postRepos } from "../repositories/posts.repos";

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

export const postControllers = {
  like,
  dislike,
};
