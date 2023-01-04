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
