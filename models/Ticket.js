const { model, Schema } = require('mongoose');

module.exports = model('Ticket', new Schema({
    _id: Schema.Types.ObjectId,
    userID: String,
    guildID: String,
    ticketID: String,
    panelName: String,
    panelID: String,
    ticketNumber: String
}));