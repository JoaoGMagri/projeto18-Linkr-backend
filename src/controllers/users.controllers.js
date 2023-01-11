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

    const { rows: users } = await usersRepos.getAllUser(idUser);

    delete user.password;

    const result = {
      posts,
      hashtags,
      users,
      user,
    };
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export const usersControllers = {
  viewAllPostsByUser,
};
