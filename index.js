var express = require("express");
var app = express();
var redis = require("redis");
var client = redis.createClient();

// serve static files from public directory
app.use(express.static("public"));

client.connect();

// init values
client.mSet('header', 0,'left', 0,'article', 0,'right', 0,'footer', 0);

client.mGet(['header', 'left', 'article', 'right', 'footer']).then (res => console.log(res));

async function getData() {
    let value = await client.mGet(['header', 'left', 'article', 'right', 'footer']);
    return {     
          header: Number(value[0]),
          left: Number(value[1]),
          article: Number(value[2]),
          right: Number(value[3]),
          footer: Number(value[4]),
        };    
  }

// get key data
app.get("/data", async function (req, res) {
  let data = await getData();
  res.send(data);
});

// plus
app.get("/update/:key/:value", async function (req, res) {
  const key = req.params.key;
  const increment = Number(req.params.value);
  const currentValue = Number(await client.get(key));
  const newValue = currentValue + increment;

  await client.set(key, newValue);

  const ret = {};
  ret[key] = newValue;

  res.send(200,ret);  
  
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});