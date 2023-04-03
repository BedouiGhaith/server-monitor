const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const RamSchema = new Schema({
        total: {
            type: String,
            required: true
        },
        used: {
            type: String,
            required: true
        },
        free: {
            type: String,
            required: true
        },
        server:{
            type: Schema.ObjectId, ref: "Server",
            required:true
        },
    },
    {
        timestamps: true
    });

module.exports = Server = mongoose.model("ram", RamSchema);
