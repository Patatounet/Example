module.exports = client => {
    async function setActivity() {
        client.user.setActivity(client.config.status.name.replace("{serversCount}", client.guilds.cache.size).replace("{usersCount}", client.getAllUsers()), { type: client.config.status.type });
    };

    setActivity().then(() => {
        setInterval(() => {
            setActivity();
        }, 60000);
    });

    client.channels.fetch(client.config.support.logs).then(channel => {
        channel.send("✅ **Le bot est connecté!**");
        console.log(`Connecté avec succès sur ${client.user.tag}`);
    }).catch(err => {
        console.log(`Unable to send messages to the log channel :`, err);
        process.exit(1);
    });
}
