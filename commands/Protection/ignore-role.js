module.exports.run = async (client, message, args, data) => {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

    if(args[0] === "add") {
        if(!role) return message.channel.send(`⚠️ Merci de spécifier un rôle à ignorer, essayez en donnant une ID ou en mentionnant le rôle`);

        if(!data.plugins.protection.ignored_roles) {
            data.plugins.protection.ignored_roles = [role.id];
        } else {
            data.plugins.protection.ignored_roles.push(role.id);
        }

        data.markModified("plugins.protection");
        data.save();

        message.channel.send(`✅ Le rôle @\u200b${role.name} sera désormais ignoré par le système de protection.`);
    } else if(args[0] === "remove") {
        if(!role) return message.channel.send(`⚠️ Merci de spécifier un rôle à ignorer, essayez en donnant une ID ou en mentionnant le rôle`);

        if(!data.plugins.protection.ignored_roles?.includes(role.id)) return message.channel.send('⚠️ Ce rôle n\'est pas ignoré par le système de protection.');

        data.plugins.protection.ignored_roles = data.plugins.protection.ignored_roles.filter((c) => c !== role.id);

        data.markModified("plugins.protection");
        data.save();

        message.channel.send(`✅ Le rôle ${role} n'est désormais plus ignoré par l'antispam`);
    } else return message.channel.send(`⚠️ Vous n'utilisez pas la commande correctement.\nFaites \`${data.prefix}ignore-role add <role>\` pour rajouter un rôle, et \`${data.prefix}ignore-role remove <role>\` pour en retirer un.`);
}

module.exports.help = {
    name: "ignore-role",
    aliases: ["ignore-role", "ignorerole"],
    category: 'Protection',
    description: "Ignorer un rôle par l'antispam",
    usage: "<add | remove> <role>",
    cooldown: 5,
    memberPerms: ["MANAGE_GUILD"],
    botPerms: ["MANAGE_GUILD"],
    args: true
}