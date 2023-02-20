const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ServerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    owner:{
        type: Schema.ObjectId, ref: "User",
        required:true
    }

});

module.exports = Server = mongoose.model("servers", ServerSchema);
