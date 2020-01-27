const mongoose = require("mongoose");
const Schema = mongoose.Schema;


/**
 * Database schema to define a party session.
 * 
 * @param {Array<String>} songList - a list of spotify track IDs of all the songs in the rotation.
 * @param {Array<String>} queue - a list of spotify track IDs of the next upcoming songs (subset of songList).
 * @param {Array<mongoose.Types.ObjectId>} members - a list of db IDs of the members sharing this session.
 */
const PartySchema = Schema({
    songList: [String],
    queue: [String],
    members: [mongoose.Types.ObjectId],
});


module.exports = mongoose.model("Party", PartySchema);