const { Client } = require("pg");
const http = require("http");

const client = new Client({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "963741!Kurylenko",
  host: process.env.DB_HOST || "db.uiigxqjkzgecjxubjlke.supabase.co",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "postgres",
});

client.connect();

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const { url, method } = req;

  if (url === "/patients" && method === "GET") {
    try {
      const result = await client.query("SELECT * FROM patients ORDER BY id;");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  }
  else if (url === "/patients" && method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { name, vitals } = JSON.parse(body);
        if (!name || !vitals) throw new Error("Missing name or vitals");
        const result = await client.query(
          "INSERT INTO patients (name, vitals, last_check) VALUES ($1, $2, NOW()) RETURNING *;",
          [name, vitals]
        );
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.rows[0]));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  }
  else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3000, () => console.log("CORS-enabled API on port 3000"));
