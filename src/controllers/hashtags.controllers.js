import { hashtagRepos } from "../repositories/hashtags.repos.js";

async function viewAll(req, res) {
  const { hashtag: name } = req.params;
  try {
    const { rows: hashtags } = await hashtagRepos.getAllHashtags();

    return res.status(200).send({ hashtags });
  } catch (error) {
    return res.status(500).send(error.message);
  }
}
async function create(req, res) {
  const { name } = req.body;
  try {
    await hashtagRepos.insertHashtag(name);

    return res.sendStatus(200);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export const hashtagsControllers = {
  create,
  viewAll,
};
