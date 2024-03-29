const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const servers = require("./routes/api/servers");


const cors=require("cors");
const {startMonitoring} = require("./routes/api/ramAuto");
const corsOptions ={
    origin:'*',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}

const app = express();

app.use(cors(corsOptions))

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
      {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize(undefined));

require("./config/passport")(passport);
app.use("/api/users", users);
app.use("/api/servers", servers);


const port = process.env.PORT || 5000;

//startMonitoring()

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
