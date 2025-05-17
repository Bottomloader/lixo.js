const { Client, Collection, GatewayIntentBits, Partials, REST, Routes, InteractionType, ChannelType, ApplicationCommandOptionType, Message } = require('discord.js');
const { QuickDB } = require("quick.db");
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');

const CommandHandler = require('../handlers/CommandHandler');
const FunctionParser = require('../handlers/FunctionParser');
const { mapIntents, mapPartials, mapOptionType, mapChannelTypes } = require('../utils/discordMappings');
const { DEFAULT_INTENTS, DEFAULT_PARTIALS, DEFAULT_PREFIX, COMMAND_TYPES, INTERACTION_COMMAND_TYPES, MESSAGE_COMMAND_TYPES } = require('../utils/constants');
const { loadFiles, requireUncached } = require('../utils/fileUtils');

class LixoClient extends Client {
    constructor(options = {}) {
        const { lixo = {}, intents: userIntents, partials: userPartials, ...djsOptions } = options;

        let finalIntents;
        if (Array.isArray(userIntents) && userIntents.length > 0) {
            finalIntents = mapIntents(userIntents);
        } else {
            console.warn("No intents provided. Defaulting to Guilds, GuildMessages, MessageContent, GuildVoiceStates.");
            finalIntents = [...DEFAULT_INTENTS];
        }
        if (!finalIntents.includes(GatewayIntentBits.GuildVoiceStates)) {
             console.warn("Adding GuildVoiceStates intent implicitly for potential voice functionality.");
             finalIntents.push(GatewayIntentBits.GuildVoiceStates);
        }

        let finalPartials;
        if (Array.isArray(userPartials) && userPartials.length > 0) {
            finalPartials = mapPartials(userPartials);
        } else {
            console.log("No partials provided. Defaulting to Channel, Message, GuildMember, User, Reaction.");
            finalPartials = [...DEFAULT_PARTIALS];
        }

        super({
            intents: finalIntents,
            partials: finalPartials,
            ...djsOptions
        });

        this.lixoOptions = {
            prefix: DEFAULT_PREFIX,
            token: process.env.DISCORD_TOKEN,
            dbPath: 'lixo_db.sqlite',
            loadBuiltinFunctions: true,
            ...lixo
        };

        this.commands = new Collection();
        this.events = new Collection();
        this.functions = new Collection();
        this.variables = new Collection();
        this.slashCommandsData = [];

        this.commandHandler = new CommandHandler(this);
        this.functionParser = new FunctionParser(this);

        try {
            this.db = new QuickDB({ filePath: this.lixoOptions.dbPath });
            console.log("Database initialized at", this.lixoOptions.dbPath);
        } catch (dbError) {
            console.error("Failed to initialize QuickDB. Database features will be unavailable.", dbError);
            this.db = null;
        }

        this.customEvents = new EventEmitter();

        if (this.lixoOptions.loadBuiltinFunctions) {
            this._loadBuiltInFunctions();
        }

        if (!this.lixoOptions.token) {
            console.warn("Bot token not found in options or DISCORD_TOKEN env var. Provide it via LixoClient options or the login() method.");
        }
    }

    register(commandData) {
        if (Array.isArray(commandData)) {
            let registered = false;
            commandData.forEach(data => {
                if (this._registerSingle(data)) registered = true;
            });
            return registered;
        } else if (typeof commandData === 'object' && commandData !== null) {
            return this._registerSingle(commandData);
        } else {
            console.warn(`Invalid data passed to register. Expected object or array.`);
            return false;
        }
    }

    _registerSingle(data) {
        if (data.event && typeof data.event === 'string' && data.code) {
            return this._registerEventHandler(data);
        } else if (data.name && data.code) {
            return this._registerCommand(data);
        } else {
            console.warn(`Invalid command/event data. Requires 'name'/'event' and 'code'.`, data);
            return false;
        }
    }

    _registerEventHandler(handlerData) {
        const eventName = handlerData.event;
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(handlerData);
        return true;
    }

    _registerCommand(commandData) {
        const nameLower = commandData.name.toLowerCase();
        const type = commandData.type || COMMAND_TYPES.BOTH;

        const key = (type === COMMAND_TYPES.SELECT_MENU || type === COMMAND_TYPES.MODAL_SUBMIT)
            ? commandData.name
            : nameLower;

        if (this.commands.has(key)) {
            console.warn(`Duplicate command/interaction key detected "${key}". Overwriting.`);
        }
        this.commands.set(key, { ...commandData, type });

        if (MESSAGE_COMMAND_TYPES.includes(type)) {
            if (commandData.aliases && Array.isArray(commandData.aliases)) {
                commandData.aliases.forEach(alias => {
                    const aliasLower = alias.toLowerCase();
                    if (aliasLower === nameLower) return;
                    if (this.commands.has(aliasLower)) {
                         const conflictingCmd = this.commands.get(aliasLower);
                         if (conflictingCmd !== commandData) {
                             console.warn(`Alias "${aliasLower}" conflicts with command/alias for "${conflictingCmd.name}". Overwriting.`);
                         }
                    }
                    this.commands.set(aliasLower, { ...commandData, type, _isAlias: true, _aliasFor: nameLower });
                });
            }
        }

        if (INTERACTION_COMMAND_TYPES.includes(type) && commandData.description) {
             this._prepareSlashCommandData(commandData, nameLower);
        } else if (INTERACTION_COMMAND_TYPES.includes(type) && !commandData.description) {
            console.warn(`Command "${commandData.name}" needs a 'description' to be registered as a slash command.`);
        }

        return true;
    }

    _prepareSlashCommandData(commandData, nameLower) {
        const slashData = {
            name: nameLower,
            description: commandData.description,
            options: [],
        };

        if (commandData.options && Array.isArray(commandData.options)) {
            slashData.options = commandData.options.map(opt => {
                if (!opt.name || !opt.description || !opt.type) {
                    console.warn(`Slash Prep: Option for command "${nameLower}" is missing name, description, or type. Skipping.`, opt);
                    return null;
                }
                const optionType = mapOptionType(opt.type);
                const processedOption = {
                    name: opt.name.toLowerCase(),
                    description: opt.description,
                    type: optionType,
                    required: opt.required === true,
                };

                if (opt.choices && Array.isArray(opt.choices)) {
                    processedOption.choices = opt.choices.map(choice => {
                        if (typeof choice === 'object' && choice.name && choice.value !== undefined) return { name: choice.name, value: choice.value };
                        if (typeof choice === 'string' && optionType === ApplicationCommandOptionType.String) return { name: choice, value: choice };
                        if (typeof choice === 'number' && (optionType === ApplicationCommandOptionType.Number || optionType === ApplicationCommandOptionType.Integer)) return { name: String(choice), value: choice };
                        console.warn(`Slash Prep: Invalid choice format for option "${opt.name}" in command "${nameLower}". Skipping choice.`, choice);
                        return null;
                    }).filter(c => c !== null);
                    if (processedOption.choices.length === 0) delete processedOption.choices;
                }

                if (opt.channel_types && Array.isArray(opt.channel_types) && optionType === ApplicationCommandOptionType.Channel) {
                     processedOption.channel_types = mapChannelTypes(opt.channel_types);
                     if (processedOption.channel_types.length === 0) delete processedOption.channel_types;
                }

                if (opt.min_value !== undefined && (optionType === ApplicationCommandOptionType.Integer || optionType === ApplicationCommandOptionType.Number)) processedOption.min_value = opt.min_value;
                if (opt.max_value !== undefined && (optionType === ApplicationCommandOptionType.Integer || optionType === ApplicationCommandOptionType.Number)) processedOption.max_value = opt.max_value;
                if (opt.min_length !== undefined && optionType === ApplicationCommandOptionType.String) processedOption.min_length = opt.min_length;
                if (opt.max_length !== undefined && optionType === ApplicationCommandOptionType.String) processedOption.max_length = opt.max_length;

                if (opt.autocomplete !== undefined && [ApplicationCommandOptionType.String, ApplicationCommandOptionType.Integer, ApplicationCommandOptionType.Number].includes(optionType)) {
                    processedOption.autocomplete = !!opt.autocomplete;
                     if (processedOption.autocomplete && processedOption.choices) {
                         console.warn(`Slash Prep: Option "${opt.name}" in command "${nameLower}" has both autocomplete=true and choices defined. Choices will be ignored by Discord.`);
                         delete processedOption.choices;
                     }
                }

                return processedOption;
            }).filter(opt => opt !== null);
        }

         const existingIndex = this.slashCommandsData.findIndex(cmd => cmd.name === nameLower);
         if (existingIndex !== -1) {
             this.slashCommandsData[existingIndex] = slashData;
         } else {
             this.slashCommandsData.push(slashData);
         }
    }

    async registerSlashCommands() {
        const token = this.token || this.lixoOptions.token;
        const clientId = this.user?.id;

        if (!token) {
            console.warn("Cannot register slash commands - Bot token is missing.");
            return;
        }
        if (!clientId) {
            console.warn("Cannot register slash commands - Client ID is unavailable (Bot not ready?). Waiting for 'ready' event.");
            this.once('ready', () => this.registerSlashCommands());
            return;
        }
        if (this.slashCommandsData.length === 0) {
            console.log("No slash commands prepared to register.");
            return;
        }

        const rest = new REST({ version: '10' }).setToken(token);

        try {
            console.log(`Refreshing ${this.slashCommandsData.length} application (/) commands.`);
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: this.slashCommandsData },
            );
            console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 'unknown number of'} application (/) commands.`);
        } catch (error) {
            console.error("Failed to register application commands:", error.response?.data || error.message || error);
        }
    }

    loadCommands(dirPath, clearExisting = true) {
        const absolutePath = path.resolve(dirPath);
        if (!fs.existsSync(absolutePath)) {
             console.error(`Commands directory not found: ${absolutePath}`);
             return;
        }

        if (clearExisting) {
             console.log("Clearing existing commands, events, and slash command data.");
             this.commands.clear();
             this.events.clear();
             this.slashCommandsData = [];
        }

        const commandFiles = loadFiles(absolutePath, '.js');
        console.log(`Loading ${commandFiles.length} command/event files from ${absolutePath}...`);
        let loadedCount = 0;

        for (const filePath of commandFiles) {
            const commandData = requireUncached(filePath);
            if (commandData) {
                if (this.register(commandData)) {
                    loadedCount++;
                } else {
                     console.warn(`File ${path.basename(filePath)} loaded but contained invalid data or failed registration.`);
                }
            }
        }
        console.log(`Processed ${loadedCount} files containing commands/events. Prepared ${this.slashCommandsData.length} slash commands.`);
    }

    addFunction(funcData) {
         if (!funcData || typeof funcData.name !== 'string' || typeof funcData.execute !== 'function') {
             console.error(`Invalid function data provided. Requires 'name' (string) and 'execute' (function):`, funcData);
             return false;
         }
         let funcName = funcData.name;
         if (!funcName.startsWith('$')) {
             funcName = `$${funcName}`;
             console.warn(`Function name "${funcData.name}" did not start with $. Renaming to "${funcName}".`);
         }
         const nameLower = funcName.toLowerCase();

         if (this.functions.has(nameLower)) {
             console.warn(`Overwriting existing function "${nameLower}"`);
         }
         this.functions.set(nameLower, { ...funcData, name: funcName });
         return true;
    }

    loadFunctions(dirPath) {
        const absolutePath = path.resolve(dirPath);
        console.log(`Loading custom functions from ${absolutePath}...`);
        if (!fs.existsSync(absolutePath)) {
            console.warn(`Custom functions directory not found: ${absolutePath}`);
            return;
        }

        const functionFiles = loadFiles(absolutePath, '.js');
        let loadedCount = 0;
        for (const filePath of functionFiles) {
             const funcData = requireUncached(filePath);
             if (funcData && this.addFunction(funcData)) {
                 loadedCount++;
             } else if (funcData) {
                 console.warn(`Custom function file ${path.basename(filePath)} loaded but contained invalid data or failed registration.`);
             }
        }
        console.log(`Loaded ${loadedCount} custom functions.`);
    }

    _loadBuiltInFunctions() {
        const funcDir = path.join(__dirname, '..', 'functions');
        console.log(`Loading built-in functions from ${funcDir}...`);

        const functionFiles = loadFiles(funcDir, '.js');
        let loadedCount = 0;
        for (const filePath of functionFiles) {
             try {
                 const funcData = require(filePath);
                 const nameLower = funcData.name?.toLowerCase();
                 if (nameLower && !this.functions.has(nameLower)) {
                     if(this.addFunction(funcData)) {
                         loadedCount++;
                     }
                 } else if (nameLower && this.functions.has(nameLower)) {
                 }
             } catch (error) {
                 console.error(`Error loading built-in function file ${path.basename(filePath)}:`, error);
             }
        }
        console.log(`Loaded ${loadedCount} built-in functions.`);
    }

    async login(token) {
        const botToken = token || this.lixoOptions.token;
        if (!botToken) {
            throw new Error("Bot token is missing. Provide it in constructor options, environment variable DISCORD_TOKEN, or login() method.");
        }
        this.lixoOptions.token = botToken;

        this._setupEventListeners();

        console.log("Logging in...");
        try {
            const loggedInToken = await super.login(botToken);
            return loggedInToken;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }

    _setupEventListeners() {
        this.once('ready', async () => {
            console.log(`Logged in as ${this.user?.tag}`);
            if (this.db) console.log("Database is ready.");
            else console.warn("Database was not initialized successfully.");

            await this.registerSlashCommands();

            console.log(`Attaching ${this.events.size} types of event handlers...`);
            let attachedCount = 0;
            for (const [eventName, handlers] of this.events) {
                this.on(eventName, async (...eventArgs) => {
                    const context = eventArgs[0];

                    if (eventName === 'messageCreate' && context instanceof Message && context.author?.bot) {
                        return;
                    }

                    for (const handlerData of handlers) {
                        try {
                            await this.commandHandler.executeCommand(handlerData, context, eventArgs.slice(1), eventName);
                        } catch (error) {
                            console.error(`Event Loop: Error executing handler for event "${eventName}" (Handler: ${handlerData.name || 'unnamed'}):`, error);
                        }
                    }
                });
                attachedCount += handlers.length;
            }
             if (attachedCount > 0) console.log(`Attached ${attachedCount} listeners across ${this.events.size} event types.`);
             else console.log(`No user-defined event handlers found to attach.`);

             this.customEvents.emit('lixoReady', this);
        });

        this.on('messageCreate', async (message) => {
             if (message.author?.bot || !message.guild) return;

             const prefix = typeof this.lixoOptions.prefix === 'function'
                ? await this.lixoOptions.prefix(message)
                : this.lixoOptions.prefix;

             if (!prefix || !message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

             const args = message.content.slice(prefix.length).trim().split(/ +/);
             const commandName = args.shift()?.toLowerCase();

             if (!commandName) return;

             const command = this.commands.get(commandName);

             if (command && MESSAGE_COMMAND_TYPES.includes(command.type)) {
                 try {
                     await this.commandHandler.executeCommand(command, message, args);
                 } catch (error) {
                     console.error(`Message Handler: Error executing message command "${command.name}":`, error);
                 }
             }
        });

        this.on('interactionCreate', async (interaction) => {
            let commandIdentifier;
            let command;
            let expectedTypes = [];
            let isAutocomplete = false;

            if (interaction.isChatInputCommand()) {
                commandIdentifier = interaction.commandName.toLowerCase();
                expectedTypes = INTERACTION_COMMAND_TYPES;
            } else if (interaction.isButton()) {
                commandIdentifier = "button";
                expectedTypes = [COMMAND_TYPES.BUTTON];
            } else if (interaction.isAnySelectMenu()) {
                commandIdentifier = interaction.customId;
                expectedTypes = [COMMAND_TYPES.SELECT_MENU];
            } else if (interaction.isModalSubmit()) {
                commandIdentifier = interaction.customId;
                expectedTypes = [COMMAND_TYPES.MODAL_SUBMIT];
            } else if (interaction.isAutocomplete()) {
                commandIdentifier = interaction.commandName.toLowerCase();
                expectedTypes = INTERACTION_COMMAND_TYPES;
                isAutocomplete = true;
             } else {
                 return;
             }

             command = this.commands.get(commandIdentifier);

             if (isAutocomplete) {
                 if (command && command.options?.some(opt => opt.name === interaction.options.getFocused(true).name && opt.autocomplete)) {
                     try {
                         await this.commandHandler.executeCommand(command, interaction, [], null, true);
                     } catch (error) {
                         console.error(`Autocomplete: Error handling autocomplete for "${commandIdentifier}":`, error);
                     }
                 } else {
                     console.warn(`Autocomplete: Received autocomplete for "${commandIdentifier}" but no matching command or autocomplete option found.`);
                      try { await interaction.respond([]); } catch {}
                 }
                 return;
             }

             if (command && expectedTypes.includes(command.type)) {
                 try {
                     await this.commandHandler.executeCommand(command, interaction, []);
                 } catch (error) {
                     console.error(`Interaction Handler: Error handling ${InteractionType[interaction.type]} interaction "${commandIdentifier}" for command "${command.name}":`, error);
                 }
             } else if (commandIdentifier) {
                 if (!command) {
                      console.warn(`Interaction Handler: Received ${InteractionType[interaction.type]} interaction for ID/Name "${commandIdentifier}" but no command was found.`);
                 } else {
                      console.warn(`Interaction Handler: Received ${InteractionType[interaction.type]} interaction for "${commandIdentifier}" but command "${command.name}" type (${command.type}) doesn't match expected type(s): ${expectedTypes.join('/')}.`);
                 }
                 if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
                     try {
                         await interaction.reply({ content: `⚠️ This interaction component (${commandIdentifier}) seems to be outdated or is not configured correctly.`, ephemeral: true }).catch(()=>{});
                     } catch {}
                 }
             }
        });

        this.on('error', (err) => console.error("Discord Client Error:", err));
        this.on('warn', (info) => console.warn("Discord Client Warning:", info));
    }
}

module.exports = LixoClient;
