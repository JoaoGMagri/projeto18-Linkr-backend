import { hashtagRepos } from "../repositories/hashtags.repos.js";

async function viewAll(req, res) {
  try {
    const { rows: hashtags } = await hashtagRepos.getAllHashtags();

    return res.status(200).send({ hashtags });
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export const hashtagsControllers = {
  viewAll,
};
