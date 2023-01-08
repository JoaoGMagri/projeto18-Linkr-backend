import { hashtagRepos } from "../repositories/hashtags.repos.js";
import { postRepos } from "../repositories/posts.repos.js";
import urlMetadata from "url-metadata";

async function publishPost(req, res) {
  const { text, url, hashtags } = req.body;
  const { rows: user } = res.locals.userExist;
  const idUser = user[0].idUser;
  try {
    const body = { text, url, idUser };

    await postRepos.insertPost(body);

    const { rows: post } = await postRepos.searchPostByUser({ ...body });

    if (!!hashtags.length) {
      hashtags.forEach(async (tag) => {
        const findTag = await hashtagRepos.findHashtag(tag);
        if (findTag.rowCount === 0) {
          await hashtagRepos.insertHashtag(tag);
        }
        const { rows: hashtag } = await hashtagRepos.findHashtag(tag);
        await hashtagRepos.addUsedHashtag({
          idHashtag: hashtag[0].id,
          idPost: post[0].id,
        });
      });
    }

    return res.status(201).send(body);
  } catch (e) {
    return res.status(500).send(e);
  }
}

async function listPosts(req, res) {
  const { rows: user } = res.locals.userExist;

  const idUser = user[0].idUser;
  try {
    const { rows: posts } = await postRepos.listPost(idUser);
    const { rows: hashtags } = await hashtagRepos.getAllHashtags();

    // const { rows: postData } = await getPostsUrl(posts);
    const result = {
      posts,
      hashtags,
    };
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

async function getPostsUrl(result) {
  let postsData = [];
  for await (let post of result) {
    let url = await getData(post.url);
    postsData.push({ ...post, ...url });
  }
  return postsData;
}

async function getData(link) {
  let data = {};
  await urlMetadata(link).then(function (metadata) {
    data.urlImage =
      metadata.image === null
        ? "https://cdn-icons-png.flaticon.com/512/3097/3097257.png"
        : metadata.image;

    data.urlTitle =
      metadata.title === null
        ? "Cannot load title information"
        : metadata.title;

    data.urlDescription =
      metadata.description === ""
        ? "Cannot load description information"
        : metadata.description;
  });
  return data;
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
    const { rows: posts } = await hashtagRepos.getPostsFromHashtag(hashtag);
    const { rows: hashtags } = await hashtagRepos.getAllHashtags();

    return res.status(200).send({ posts, hashtags });
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
