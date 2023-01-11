import { hashtagRepos } from "../repositories/hashtags.repos.js";
import { usersRepos } from "../repositories/users.repos.js";

async function viewAllPostsByUser(req, res) {
  const { id } = req.params;
  const { rows: user } = res.locals.userExist;
  const idUser = user[0].idUser;
  try {
    const {
      rows: [user],
    } = await usersRepos.getUser(id);
    const { rows: posts } = await usersRepos.getAllPostsUsers({ idUser, id });
    const { rows: hashtags } = await hashtagRepos.getAllHashtags();
    const follow = await usersRepos.getFollow(id, idUser);
    delete user.password;

    const result = {
      posts,
      hashtags,
      user,
      follow: follow.rows[0],
    };
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

async function follow(req, res) {
  const { id } = req.body;
  const { rows: user } = res.locals.userExist;
  const idUser = user[0].idUser;

  try {
    const follow = await usersRepos.getFollow(id, idUser);
    if (follow.rowCount !== 0) {
      return res.sendStatus(400);
    }
    const result = await usersRepos.createFollow(id, idUser)
    return res.send(result.rows[0]).status(200);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
}

async function unfollow(req, res) {
  const { id } = req.params;
  const { rows: user } = res.locals.userExist;
  const idUser = user[0].idUser;

  try {
    const follow = await usersRepos.getFollow(id, idUser);
    if (follow.rowCount !== 0) {
      return res.sendStatus(400);
    }
    await usersRepos.deleteFollow(id)
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
}

export const usersControllers = {
  viewAllPostsByUser,
  follow,
  unfollow
};
