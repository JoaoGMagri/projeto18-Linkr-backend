import { hashtagRepos } from "../repositories/hashtags.repos";

async function viewAll(req, res) {
  const { hashtag: name } = req.params;
  try {
    const hashtags = await hashtagRepos.getAllHashtags();

    return res.status(200).send({ hashtags });
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export const hashtagsControllers = {
  viewAll,
};
