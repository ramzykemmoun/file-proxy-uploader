import express from "express";
import multer from "multer";
import path from "path";
import fs, { PathLike } from "fs";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import "dotenv/config";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function authenticateToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET_OR_KEY!, (err) => {
    if (err) return res.sendStatus(403);
    next();
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "./public/uploads";
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

app.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    const file = req.file;
    console.log({ file });
    if (!file) res.status(500).json({ error: "File not found" });
    const compressedPath = path.join("uploads", "compressed-" + file?.filename);

    try {
      console.log({ path: file?.path });
      await sharp(file?.path)
        .resize(800)
        .jpeg({ quality: 70 })
        .toFile(compressedPath);

      fs.unlinkSync(file?.path as PathLike);
      res.json({ url: `/public/uploads/${path.basename(compressedPath)}` });
    } catch (err) {
      console.log({ err });
      res.status(500).json({ error: "Compression failed" });
    }
  }
);

app.delete("/delete/:filename", authenticateToken, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.send("Deleted");
  } else {
    res.status(404).send("File not found");
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(process.env.PORT, () =>
  console.log(`File server is running on port ${process.env.PORT}`)
);
