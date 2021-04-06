const { model, Schema } = require('mongoose');

module.exports = model("PrivateChannel", new Schema(
    {
        _id: Schema.Types.ObjectId,
        channelID: {
            type: String,
            required: true,
            unique: true
        },
        ownerID: {
            type: String,
            required: true,
            unique: true
        },
    }
))