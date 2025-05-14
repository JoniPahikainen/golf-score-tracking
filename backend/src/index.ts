import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.listen(3001, () => {
  console.log("Backend running at http://localhost:3001");
});
