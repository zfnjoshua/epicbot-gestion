const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Player } = require("discord-music-player");

class Client extends Discord.Client {
    constructor () {
        super({
            fetchAllMembers: true,
            intents: 32767,
            partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_PRESENCES', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'USER']
        })

        this.commands = new Discord.Collection()
        this.aliases = new Discord.Collection()
        this.cooldowns = new Discord.Collection()
        this.config = require('../config')
        this.perms = require('../perm.json')
        this.snipes = new Map()
        this.guildInvites = new Map()
        this.player = new Player(this, {
            leaveOnEmpty: false, 
        });

        this.login(this.config.token).then(() => {
            this.initCommands().then(() => {
                this.initEvents().then(() => {
                    this.initHandler()
                })
            })
        })
    }

    async initCommands() {
        const commandDir = './commands';
        try {
            const subFolders = await fs.promises.readdir(commandDir);
            for (const category of subFolders) {
                const commandPath = path.join(commandDir, category);
                const commandsFiles = await fs.promises.readdir(commandPath).then(files => files.filter(file => file.endsWith('.js')));
                for (const commandFile of commandsFiles) {
                    const commandPathAbs = path.join(commandPath, commandFile);
                    const command = require(commandPathAbs);
                    if (!command) return;
                    this.commands.set(command.name, command);
                    if (command.aliases && command.aliases.length > 0) {
                        command.aliases.forEach(alias => this.aliases.set(alias, command));
                    }
                }
            }
        } catch (err) {
            console.error(`Error initializing commands: ${err}`);
        }
    }

    /*async database() {
        try {
            var promiseDB = await createConnextion.promise();
            return promiseDB;
        } catch (err) {
            console.error(`Error connecting to database: ${err}`);
        }
    }*/

    initEvents(){
        const eventDir = './events';
        try {
            fs.promises.readdir(eventDir).then(dirs => {
                for (const dir of dirs) {
                    const eventPath = path.join(eventDir, dir);
                    fs.promises.readdir(eventPath).then(files => {
                        for(const file of files){
                            if (!file.endsWith(".js")) continue;
                            const eventPathAbs = path.join(eventPath, file);
                            const event = require(eventPathAbs);
                            if (!event) return;
                            this.on(event.name, (...args) => event.run(this, ...args));
                        }
                    });
                }
            });
        } catch (err) {
            console.error(`Error initializing events: ${err}`);
        }
    }

    initHandler(){
        const handlerDir = './base/handler';
        try {
            fs.promises.readdir(handlerDir).then(files => {
                for(const file of files){
                    if (!file.endsWith('.js')) continue;
                    const handlerPath = path.join(handlerDir, file);
                    const handler = require(handlerPath);
                    if (!handler) return;
                    this.on(handler.name, (...args) => handler.run(this, ...args));
                }
            });
        } catch (err) {
            console.error(`Error initializing handlers: ${err}`);
        }
    }
}
