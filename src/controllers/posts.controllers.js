function like(req, res) {
  const { idPost: id } = req.params;
  try {
    console.log("like this post:", id);

    return res.status(200).send();
  } catch (e) {
    return res.status(500).send();
  }
}
function dislike(req, res) {
  const { idPost: id } = req.params;
  try {
    console.log("dislike this post:", id);

    return res.status(200).send();
  } catch (e) {
    return res.status(500).send();
  }
}

export const postControllers = {
  like,
  dislike,
};
