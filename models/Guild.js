const { model, Schema } = require('mongoose');
const config = require('../config');

module.exports = model("Guild", new Schema(
    {
        _id: Schema.Types.ObjectId,
        id: String,
        lang: {
            type: String,
            default: config.defaultsSettings.lang
        },
        prefix: {
            type: String,
            default: config.prefix
        },
        members: [],
        plugins: {
            type: Object,
            default: {
                protection: {
                    raidmode: false,
                    antigiverole: false,
                    antiban: false,
                    antilink: false,
                    antimaj: false,
                    antispam: {
                        enabled: false,
                        ignored_channels: []
                    }
                },
                welcome: {
                    enabled: false,
                    message: config.defaultsSettings.welcomeMessage,
                    channel: null
                },
                goodbye: {
                    enabled: false,
                    message: config.defaultsSettings.goodbyeMessage,
                    channel: null
                },
                logs: {
                    enabled: false,
                    channel: null
                },
                autorole: {
                    enabled: false,
                    role: null
                },
                suggestion: {
                    enabled: false,
                    channel: null
                },
                economy: {
                    enabled: true,
                    currency: "$"
                },
                levels: {
                    enabled: true,
                    level_up_channel: null,
                    level_up_message: null,
                    roles_rewards: []
                },
                privatechannels: {
                    channelID: null
                }
            }
        },
        muterole: {
            type: String,
            default: null
        },
        lastBanTimestamp: {
            type: Number,
            default: null
        },
        lastBanExecutor: {
            type: String,
            default: null
        }
    }
))
