const { Schema, model } = require('mongoose');

module.exports = model("User", new Schema(
    {
        _id: Schema.Types.ObjectId,
        id: String,
        warns: {
            type: Array,
            default: []
        },
        afk: {
            type: Object,
            default: {
                is_afk: false,
                reason: null
            }
        },
        tempmutes: {
            type: Array,
            default: []
        },
        money: {
            type: Number,
            default: 0
        },
        bank: {
            type: Number,
            default: 0
        },
        cooldowns: {
            type: Object,
            default: {
                work: null,
                rob: null,
                crime: null,
                daily: null,
                weekly: null
            }
        },
        rankcard: {
            type: Object,
            default: {
                progress_bar_color: "#0F7FBB",
                text_color: "#0F7FBB",
                avatar_color: "#ffffff",
                background: null
            }
        },
        uno_played: {
            type: Array,
            default: []
        }
    }
));
