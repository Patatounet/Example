const mongoose = require('mongoose');
const Guild = require('../models/Guild');

module.exports = async client => {
    client.createGuild = async guild => {
        const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, guild);
        const createGuild = await new Guild(merged);
        createGuild.save();
    }

    client.getGuild = async guild => {
        const data = await Guild.findOne({ id: guild.id })
        if(data) return data;
        return null;
    }

    client.updateGuild = async (guild, data) => {
        let data_ = await client.getGuild(guild);
        if(typeof data_ !== "object") data_ = {};
        for (const key in data) {
            if(data_[key] !== data[key]) data_[key] = data[key];
        }
        return data_.updateOne(data);
    }
    
    client.getAllUsers = () => {
        let size = 0;
        client.guilds.cache.forEach(g => {
            size = size + g.memberCount;
        })
        return String(size).replace(/(.)(?=(\d{3})+$)/g, '$1 ');
    }
    
    client.formatPermissions = content => {
        if(!content || (typeof (content) != 'string')) throw new Error("Please specify a message to format.");
        content = content.replace("CREATE_INSTANT_INVITE", "Créer une invitation");
        content = content.replace("BAN_MEMBERS", "Bannir des membres");
        content = content.replace("MANAGE_CHANNELS", "Gérer les salons");
        content = content.replace("ADD_REACTIONS", "Ajouter des réactions");
        content = content.replace("PRIORITY_SPEAKER", "Voix prioritaire");
        content = content.replace("SEND_TTS_MESSAGES", "Envoyer des messages TTS");
        content = content.replace("EMBED_LINKS", "Intégrer des liens");
        content = content.replace("READ_MESSAGE_HISTORY", "Voir les anciens messages");
        content = content.replace("USE_EXTERNAL_EMOJIS", "Utiliser des emojis externes");
        content = content.replace("CONNECT", "Se connecter");
        content = content.replace("MUTE_MEMBERS", "Couper le micro des membres");
        content = content.replace("VIEW_CHANNEL", "Voir le salon");
        content = content.replace("MOVE_MEMBERS", "Déplacer des membres");
        content = content.replace("CHANGE_NICKNAME", "Changer le pseudo");
        content = content.replace("MANAGE_ROLES", "Gérer les rôles");
        content = content.replace("MANAGE_EMOJIS", "Gérer les emojis");
        content = content.replace("KICK_MEMBERS", "Expulser des membres");
        content = content.replace("ADMINISTRATOR", "Administrateur");
        content = content.replace("MANAGE_GUILD", "Gérer le serveur");
        content = content.replace("VIEW_AUDIT_LOG", "Voir les logs du serveur");
        content = content.replace("STREAM", "Vidéo");
        content = content.replace("SEND_MESSAGES", "Envoyer des messages");
        content = content.replace("MANAGE_MESSAGES", "Gérer les messages");
        content = content.replace("ATTACH_FILES", "Joindre des fichiers");
        content = content.replace("MENTION_EVERYONE", "Mentionner @\u200beveryone, @\u200bhere et tous les rôles");
        content = content.replace("VIEW_GUILD_INSIGHTS", "Voir les analyses de serveur");
        content = content.replace("SPEAK", "Parler");
        content = content.replace("DEAFEN_MEMBERS", "Mettre en sourdine des membres");
        content = content.replace("USE_VAD", "Utiliser la Détection de voix");
        content = content.replace("MANAGE_NICKNAMES", "Gérer les pseudos");
        content = content.replace("MANAGE_WEBHOOKS", "Gérer les webhooks");

        return content;
    }
}
