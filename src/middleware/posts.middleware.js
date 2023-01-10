import { postRepos } from "../repositories/posts.repos.js";

export async function urlValidation(req, res, next) {
  try {
    const { url } = req.body;
    const validUrl =
      url.substring(0, 7) === "http://" || url.substring(0, 8) === "https://";

    if (!validUrl) {
      return res.sendStatus(422);
    }
  } catch {
    return res.sendStatus(500);
  }

  next();
}

export async function deleteValidation(req, res, next) {
  const { idPost } = req.params;
  try {
    const idExists = postRepos.searchIdPost(idPost);

    if (idExists.rowCount === 0) {
      return res.sendStatus(404);
    }
  } catch (e) {
    return console.log(e), res.sendStatus(500);
  }
  next();
}

export async function updateValidation(req, res, next) {
  const { idPost } = req.params;

  try {
    const idExists = await postRepos.searchIdPost(idPost);
    if (idExists.rowCount === 0) {
      return res.sendStatus(404);
    }
  } catch (e) {
    return console.log(e), res.sendStatus(500);
  }
  next();
}
