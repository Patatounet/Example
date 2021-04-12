module.exports = async (client, member) => {
    const data = await client.getGuild(member.guild);
    if(!data) return;

    await client.findOrCreateUser(member.user);

    if(data.plugins.protection.raidmode === true) {
        member.send("**⚠️ Le Raidmode est activé sur le serveur " + member.guild.name + ", vous avez donc été kick de celui-ci! ⚠️** \nSi vous pensez que c'est une erreur, contactez le propriétaire du serveur.").catch(() => {});
        member.kick("Raidmode activé").catch(err => console.log(err));

        if(data.plugins.logs.channel) {
            member.guild.channels.cache.get(data.plugins.logs.channel).send(`**${member.user.tag}** a tenté de rejoindre le serveur, mais le Raidmode est activé. ${client.user.username} l'a donc expulsé du serveur.`);
        }
    }

    if(data.plugins.autorole.enabled) {
        if(data.plugins.autorole.role) {
            await member.roles.add(data.plugins.autorole.role).catch(() => {});
        }
    }

    if(!data.plugins.welcome.enabled) return;

    let welcomeMsg = data.plugins.welcome.message
        .replace('{user}', member)
        .replace('{guildName}', member.guild.name)
        .replace('{memberCount}', member.guild.memberCount)
        .replace('{username}', member.user.username)
        .replace('{usertag}', member.user.tag);

    if(!data.plugins.welcome.channel) {
        await member.send(welcomeMsg).catch(() => {});
    } else {
        if(member.guild.channels.cache.get(data.plugins.welcome.channel)) {
            member.guild.channels.cache.get(data.plugins.welcome.channel).send(welcomeMsg);
        }
    }
}
