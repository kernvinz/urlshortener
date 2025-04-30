import dotenv from "dotenv";
import express from "express";
import cors from "cors";
dotenv.config();

const app = express();
const router = express.Router()
import { db } from "./db/knex";
import { urlInsertion, urlRedirect } from "./services/url.service";

//middleware
app.use(cors());
app.use(express.json());


app.get("/", async (_req, res) => {
  res.json({ hello: "world", "client-default-port": 3000 });
});

// URL Redirection API
app.get("/:slug", async (req:any, res:any) => {
  try {
    const { status, message, redirect } = await urlRedirect(req.params.slug);
    if (status === 302) {
      return res.redirect(redirect);
    }
    return res.status(status).send(message);
  } catch (error) {
    console.error('Error during redirection:', error);
    return res.status(500).send('Server error');
  }
});

// URL Shortening API
app.post("/api/v1/shortenurl", async (req:any, res:any) => {
  try {
    if (!req.body.finalUrl) {
      return res.status(400).json({ error: 'Missing finalUrl in the request body' });
    }
    const shortenedUrl = await urlInsertion(req.body);
    return res.status(200).json({ shortenedUrl });
  } catch (error:any) {
    console.error('❌ Error during URL shortening:', error.message);
    return res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
