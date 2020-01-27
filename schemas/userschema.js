const mongoose = require("mongoose");
const Schema = mongoose.Schema;


/**
 * Database schema to define a user.
 * 
 * @param {String} username - the user's spotify username.
 * @param {String} email - the email associated with the user's spotify account.
 * @param {String} displayName - the user's spotify display name.
 * @param {Boolean} isPremium - the user's spotify premium account status.
 * @param {mongoose.Types.ObjectId} party - the listening party the user is currently a member of.
 */
const UserSchema = Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    isPremium: {
        type: Boolean,
        required: true,
    },
    party: mongoose.Types.ObjectId,
});


module.exports = mongoose.model("User", UserSchema);