const { model, Schema } = require('mongoose');

module.exports = model('RolesReactions', new Schema(
    {
        _id: Schema.Types.ObjectId,
        guildID: {
            type: String,
            required: true
        },
        messageID: {
            type: String,
            required: true,
            unique: true
        },
        roles_react: {
            type: Array,
            default: []
        }
    }
));