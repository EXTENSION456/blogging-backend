import express from "express";
const app = express();

app.get("/test", (req, res) => {
  res.send("Hello from minimal server");
});

app.listen(process.env.PORT, () => {
  console.log("Minimal server running on port 3000");
});
