const { model, Schema } = require('mongoose');

module.exports = model('Command', new Schema({
    _id: Schema.Types.ObjectId,
    guildID: {
        required: true,
        type: String
    },
    name: {
        requires: true,
        type: String
    },
    public: {
        type: Boolean,
        default: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    content: {
        type: String,
        default: null
    },
    embed: {
        type: Object,
        default: null
    },
    image: {
        type: String,
        default: null
    },
    whitelisted_members: {
        type: Array,
        default: []
    },
    whitelisted_roles: {
        type: Array,
        default: []
    },
    whitelisted_channels: {
        type: Array,
        default: []
    }
}));