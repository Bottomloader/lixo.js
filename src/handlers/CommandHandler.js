const {
    EmbedBuilder, Collection, InteractionType, ActionRowBuilder, Message, BaseInteraction, GuildMember, User, Role, MessageFlags,
    BaseGuildTextChannel, BaseGuildVoiceChannel, ForumChannel, StageChannel, ThreadChannel, CategoryChannel,
    Guild, VoiceState, Typing, Presence, MessageReaction, GuildBan, Invite,
    ComponentType, ButtonBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder, RoleSelectMenuBuilder,
    MentionableSelectMenuBuilder, ChannelSelectMenuBuilder, ModalBuilder,
    ContainerBuilder, TextDisplayBuilder, SeparatorSpacingSize
} = require('discord.js');
const StopExecutionError = require('../errors/StopExecutionError');
const { COMMAND_TYPES } = require('../utils/constants'); 

function createBaseExecutionContext(client, commandOrEvent, context, eventArgs, eventName) {
    const isEvent = !!eventName;
    return {
        client: client,
        command: isEvent ? null : commandOrEvent,
        eventData: isEvent ? commandOrEvent : null,
        eventName: eventName,
        rawContext: context,
        rawEventArgs: eventArgs,
        guild: null,
        channel: null,
        user: null,
        member: null,
        message: null,
        interaction: null,
        args: [],
        options: null,
        values: null,
        fields: null,
        variables: client.variables,
        localVariables: new Map(),
        embedData: {},
        components: [],
        attachments: [],
        modal: null,
        auditLogReason: null,
        parsedJson: null,
        messageSent: false,
        replied: false,
        deferred: false,
        lastMessageID: null,
        lastMessage: null,
    };
}

function identifyContext(executionContext, context, eventArgs, eventName) {
    const { client } = executionContext;
    executionContext.eventName = eventName || executionContext.eventName;

    if (context instanceof BaseInteraction) {
        executionContext.interaction = context;
        executionContext.user = context.user;
        executionContext.member = context.member instanceof GuildMember ? context.member : null;
        executionContext.guild = context.guild;
        executionContext.channel = context.channel;
        executionContext.replied = context.replied ?? false;
        executionContext.deferred = context.deferred ?? false;

        if (context.isChatInputCommand?.()) {
            executionContext.options = context.options;
        } else if (context.isAnySelectMenu?.()) {
            executionContext.values = context.values;
        } else if (context.isModalSubmit?.()) {
            executionContext.fields = context.fields;
        } else if (context.isAutocomplete?.()) {
            executionContext.options = context.options;
        }
        return;
    }

    if (context instanceof Message) {
        executionContext.message = context;
        executionContext.user = context.author;
        executionContext.member = context.member;
        executionContext.guild = context.guild;
        executionContext.channel = context.channel;

        if (eventName === 'messageCreate' && !executionContext.command) {
             executionContext.args = context.content?.split(/ +/) ?? [];
        } else if (executionContext.command && executionContext.command.type !== COMMAND_TYPES.EVENT) {
             executionContext.args = eventArgs;
        }

        if (eventName === 'messageCreate') executionContext.createdMessage = context;
        if (eventName === 'messageDelete') executionContext.deletedMessage = context;
        if (eventName === 'messageUpdate' && eventArgs[0] instanceof Message) {
            executionContext.oldMessage = context;
            executionContext.newMessage = eventArgs[0];
        }
        if (eventName === 'messageReactionRemoveAll') executionContext.reactionsMessage = context;
        return;
    }

    switch (eventName) {
        case 'guildMemberAdd':
        case 'guildMemberRemove':
            if (context instanceof GuildMember) {
                executionContext.member = context;
                executionContext.user = context.user;
                executionContext.guild = context.guild;
                if (eventName === 'guildMemberAdd') executionContext.newMember = context;
                if (eventName === 'guildMemberRemove') executionContext.removedMember = context;
            }
            break;
        case 'guildMemberUpdate':
             if (context instanceof GuildMember && eventArgs[0] instanceof GuildMember) {
                executionContext.oldMember = context;
                executionContext.newMember = eventArgs[0];
                executionContext.member = eventArgs[0];
                executionContext.user = eventArgs[0].user;
                executionContext.guild = eventArgs[0].guild;
            }
            break;
        case 'userUpdate':
             if (context instanceof User && eventArgs[0] instanceof User) {
                executionContext.oldUser = context;
                executionContext.newUser = eventArgs[0];
                executionContext.user = eventArgs[0];
            }
            break;
        case 'guildBanAdd':
        case 'guildBanRemove':
            if (context instanceof GuildBan) {
                executionContext.ban = context;
                executionContext.user = context.user;
                executionContext.guild = context.guild;
            }
            break;
        case 'roleCreate':
        case 'roleDelete':
            if (context instanceof Role) {
                executionContext.role = context;
                executionContext.guild = context.guild;
                if (eventName === 'roleCreate') executionContext.createdRole = context;
                if (eventName === 'roleDelete') executionContext.deletedRole = context;
            }
            break;
        case 'roleUpdate':
             if (context instanceof Role && eventArgs[0] instanceof Role) {
                executionContext.oldRole = context;
                executionContext.newRole = eventArgs[0];
                executionContext.role = eventArgs[0];
                executionContext.guild = eventArgs[0].guild;
            }
            break;
        case 'channelCreate':
        case 'channelDelete':
            if (context instanceof BaseGuildTextChannel || context instanceof BaseGuildVoiceChannel || context instanceof ForumChannel || context instanceof StageChannel || context instanceof ThreadChannel || context instanceof CategoryChannel) {
                executionContext.channel = context;
                executionContext.guild = context.guild;
                 if (eventName === 'channelCreate') executionContext.createdChannel = context;
                 if (eventName === 'channelDelete') executionContext.deletedChannel = context;
            }
            break;
        case 'channelUpdate':
             const oldCh = context;
             const newCh = eventArgs[0];
              if ((oldCh instanceof BaseGuildTextChannel || oldCh instanceof BaseGuildVoiceChannel || oldCh instanceof ForumChannel || oldCh instanceof StageChannel || oldCh instanceof ThreadChannel || oldCh instanceof CategoryChannel) &&
                  (newCh instanceof BaseGuildTextChannel || newCh instanceof BaseGuildVoiceChannel || newCh instanceof ForumChannel || newCh instanceof StageChannel || newCh instanceof ThreadChannel || newCh instanceof CategoryChannel))
              {
                 executionContext.oldChannel = oldCh;
                 executionContext.newChannel = newCh;
                 executionContext.channel = newCh;
                 executionContext.guild = newCh.guild;
             }
            break;
        case 'voiceStateUpdate':
            if (context instanceof VoiceState && eventArgs[0] instanceof VoiceState) {
                executionContext.oldState = context;
                executionContext.newState = eventArgs[0];
                executionContext.member = eventArgs[0].member;
                executionContext.user = eventArgs[0].member?.user;
                executionContext.guild = eventArgs[0].guild;
                executionContext.channel = eventArgs[0].channel;
            }
            break;
        case 'presenceUpdate':
             const oldPresence = context instanceof Presence ? context : null;
             const newPresence = eventArgs[0] instanceof Presence ? eventArgs[0] : null;
             if (newPresence) {
                 executionContext.oldPresence = oldPresence;
                 executionContext.newPresence = newPresence;
                 executionContext.member = newPresence.member;
                 executionContext.user = newPresence.user ?? newPresence.member?.user;
                 executionContext.guild = newPresence.guild;
             }
            break;
        case 'typingStart':
            if (context instanceof Typing) {
                executionContext.typing = context;
                executionContext.user = context.user;
                executionContext.member = context.member;
                executionContext.guild = context.guild;
                executionContext.channel = context.channel;
            }
            break;
        case 'inviteCreate':
        case 'inviteDelete':
            if (context instanceof Invite) {
                executionContext.invite = context;
                executionContext.guild = context.guild;
                executionContext.channel = context.channel;
                executionContext.user = context.inviter;
                executionContext.member = context.guild?.members.resolve(context.inviter?.id);
            }
            break;
        case 'messageReactionAdd':
        case 'messageReactionRemove':
             if (context instanceof MessageReaction && eventArgs[0] instanceof User) {
                const reaction = context;
                const user = eventArgs[0];
                executionContext.reaction = reaction;
                executionContext.reactionUser = user;
                executionContext.message = reaction.message;
                executionContext.channel = reaction.message.channel;
                executionContext.guild = reaction.message.guild;
                executionContext.member = reaction.message.guild?.members.resolve(user.id);
                executionContext.user = user;

                if (eventName === 'messageReactionAdd') executionContext.addedReaction = reaction;
                if (eventName === 'messageReactionRemove') executionContext.removedReaction = reaction;
             }
            break;
         case 'messageReactionRemoveEmoji':
             if (context instanceof MessageReaction) {
                executionContext.emojiReaction = context;
                executionContext.message = context.message;
                executionContext.channel = context.message.channel;
                executionContext.guild = context.message.guild;
            }
            break;
    }
}

function buildResponsePayload(context) {
    const payload = {};

    const finalResult = typeof context.finalResult === 'string' ? context.finalResult.trim() : '';
    if (finalResult) {
        payload.content = finalResult;
    }

    if (context.embedData && Object.keys(context.embedData).length > 0) {
        try {
            const embed = new EmbedBuilder(context.embedData);
            if (embed.data.title || embed.data.description || embed.data.fields?.length || embed.data.image || embed.data.thumbnail || embed.data.author || embed.data.footer) {
                 payload.embeds = [embed];
            } else if (!payload.content) {
            } else {
            }
        } catch (e) {
            console.error(`CommandHandler: Error building embed for command/event:`, e);
            payload.content = `Error building embed: ${e.message}` + (payload.content ? `\n${payload.content}` : '');
        }
    }

    if (context.components && context.components.length > 0) {
        payload.components = [];
        let currentRow = new ActionRowBuilder();
        for (const componentData of context.components) {
            if (!componentData || typeof componentData !== 'object') {
                console.error("CommandHandler Response: Skipping invalid component data:", componentData);
                continue;
            }

            if (currentRow.components.length >= 5) {
                payload.components.push(currentRow);
                currentRow = new ActionRowBuilder();
            }

            try {
                let componentToAdd;
                if (typeof componentData.toJSON === 'function' && componentData.data) {
                    componentToAdd = componentData;
                }
                else if (componentData instanceof ContainerBuilder) {
                    componentToAdd = new ContainerBuilder(componentData); 
                    payload.flags = MessageFlags.IsComponentsV2; 
                } else if (componentData.type) {
                    switch (componentData.type) {
                        case ComponentType.Button: componentToAdd = new ButtonBuilder(componentData); break;
                        case ComponentType.StringSelect: componentToAdd = new StringSelectMenuBuilder(componentData); break;
                        case ComponentType.UserSelect: componentToAdd = new UserSelectMenuBuilder(componentData); break;
                        case ComponentType.RoleSelect: componentToAdd = new RoleSelectMenuBuilder(componentData); break;
                        case ComponentType.MentionableSelect: componentToAdd = new MentionableSelectMenuBuilder(componentData); break;
                        case ComponentType.ChannelSelect: componentToAdd = new ChannelSelectMenuBuilder(componentData); break;
                        case ComponentType.TextDisplay: componentToAdd = new TextDisplayBuilder(componentData); payload.flags = MessageFlags.IsComponentsV2; break;
                        default: console.warn(`CommandHandler Response: Unsupported component type ${componentData.type} found.`); componentToAdd = null;
                    }
                } else {
                    console.error("CommandHandler Response: Component data lacks 'type' or is not a builder:", componentData);
                    componentToAdd = null;
                }

                if (componentToAdd) {
                  const isV2 = componentToAdd instanceof ContainerBuilder || componentToAdd instanceof TextDisplayBuilder;

                if (!isV2) {
                  currentRow.addComponents(componentToAdd);
                } else {
                  if (currentRow.components.length > 0) {
                    payload.components.push(currentRow.toJSON());
                    currentRow = new ActionRowBuilder();
                  }
                  payload.components.push(componentToAdd.toJSON());
                  payload.flags = MessageFlags.IsComponentsV2;
                  payload.content = null;
                }
              }
            } catch (e) {
                console.error(`CommandHandler Response: Error processing component. Data: ${JSON.stringify(componentData)}. Error:`, e);
            }
        }
        if (currentRow.components.length > 0) {
            payload.components.push(currentRow);
        }
        payload.components = payload.components.filter(comp => {
          if ("components" in comp) {
            return Array.isArray(comp.components) && comp.components.length > 0;
          }
          return true; 
        });
        if (payload.components.length === 0) {
            delete payload.components;
        }
    }

     if (context.attachments && context.attachments.length > 0) {
          payload.files = context.attachments;
     }

    payload.hasContent = !!(payload.content || payload.embeds?.length || payload.components?.length || payload.files?.length);

    return payload;
}

async function sendResponse(context, payload) {
    if (!payload.hasContent) {
        return;
    }

    let sentMessage = null;

    try {
        if (context.interaction && context.interaction.isRepliable()) {
            if (context.deferred || context.replied) {
                sentMessage = await context.interaction.followUp(payload).catch(e => {
                    console.error(`CommandHandler Response: Error sending followUp for interaction ${context.interaction.id}:`, e.message);
                });
                context.messageSent = true;
            } else {
                sentMessage = await context.interaction.reply({ ...payload, fetchReply: true }).catch(e => {
                    console.error(`CommandHandler Response: Error sending reply for interaction ${context.interaction.id}:`, e.message);
                });
                context.replied = true;
                context.messageSent = true;
            }
        }
        else if (context.channel?.isTextBased()) {
             sentMessage = await context.channel.send(payload).catch(e => {
                  console.error(`CommandHandler Response: Error sending message to channel ${context.channel.id}:`, e.message);
             });
             context.messageSent = true;
        }
        else if (context.eventName && !context.channel && context.guild?.systemChannel?.isTextBased()) {
            console.warn(`CommandHandler Response: Event "${context.eventName}" context lacks a specific channel. Attempting to send to system channel ${context.guild.systemChannel.id}.`);
            sentMessage = await context.guild.systemChannel.send(payload).catch(e => {
                 console.error(`CommandHandler Response: Error sending message to system channel ${context.guild.systemChannel.id}:`, e.message);
            });
            context.messageSent = true;
        }
         else if (context.eventName) {
              console.warn(`CommandHandler Response: Cannot implicitly send response for event "${context.eventName}" - no usable channel context found.`);
         }
         else {
              console.warn(`CommandHandler Response: Cannot implicitly send response - no usable interaction or channel context found.`);
         }

    } catch (error) {
         console.error(`CommandHandler Response: Unexpected error during sending:`, error);
         context.messageSent = true;
    }

    if (sentMessage instanceof Message) {
         context.lastMessage = sentMessage;
         context.lastMessageID = sentMessage.id;
    } else if (sentMessage) {
    }
}

async function handleExecutionError(context, error) {
    const commandName = context.command?.name || context.eventData?.name || context.eventName || 'unknown process';

    if (error instanceof StopExecutionError) {
        const stopMessage = error.message;
        if (!context.messageSent && stopMessage) {
            const payload = { content: stopMessage, ephemeral: true, embeds: [], components: [], files: [] };
            try {
                if (context.interaction && context.interaction.isRepliable()) {
                     if (context.deferred || context.replied) {
                         await context.interaction.followUp(payload).catch(console.error);
                     } else {
                         await context.interaction.reply(payload).catch(console.error);
                         context.replied = true;
                     }
                } else if (context.channel?.isTextBased()) {
                     payload.ephemeral = false;
                     await context.channel.send({content: stopMessage}).catch(console.error);
                 }
                 context.messageSent = true;
            } catch(e) { console.error(`CommandHandler StopError Handler: Error sending stop message for "${commandName}":`, e)}
        } else if (!context.messageSent) {
            context.messageSent = true;
        }

    } else {
        console.error(`CommandHandler: Unhandled error during execution of "${commandName}":`, error);
        const errorMessage = `❌ An internal error occurred while processing this. (${error.message || 'Unknown Error'})`;

        if (!context.messageSent) {
             const payload = { content: errorMessage, ephemeral: true, embeds: [], components: [], files: [] };
             try {
                  if (context.interaction && context.interaction.isRepliable()) {
                      if (context.deferred || context.replied) {
                          await context.interaction.followUp(payload).catch(console.error);
                      } else {
                          await context.interaction.reply(payload).catch(console.error);
                          context.replied = true;
                      }
                  } else if (context.channel?.isTextBased()) {
                        payload.ephemeral = false;
                       await context.channel.send({content: errorMessage}).catch(console.error);
                   }
                   context.messageSent = true;
             } catch (replyError) {
                  console.error(`CommandHandler Error Handler: Failed to send execution error message for "${commandName}":`, replyError);
             }
        }
    }
}


class CommandHandler {
    constructor(client) {
        this.client = client;
    }

    async executeCommand(commandOrEvent, context, eventArgs = [], eventName = null, isAutocomplete = false) {
        const executionContext = createBaseExecutionContext(this.client, commandOrEvent, context, eventArgs, eventName);
        identifyContext(executionContext, context, eventArgs, eventName || commandOrEvent?.event);

        try {
            const codeToParse = commandOrEvent.code;
            if (!codeToParse) {
                 console.warn(`CommandHandler: No 'code' found for ${executionContext.command ? `command "${executionContext.command.name}"` : `event "${executionContext.eventName}"`}. Skipping execution.`);
                 return;
            }

            const parseResult = await this.client.functionParser.parse(codeToParse, executionContext);
            executionContext.finalResult = parseResult;

            if (isAutocomplete) {
                 if (!executionContext.messageSent) {
                      console.warn(`CommandHandler Autocomplete: Execution finished for "${executionContext.command.name}", but no autocomplete response was sent (use $autocompleteResult).`);
                 }
                return;
            }

            if (executionContext.modal instanceof ModalBuilder &&
                executionContext.interaction?.isRepliable() &&
                !executionContext.messageSent &&
                !executionContext.replied &&
                !executionContext.deferred)
            {
                try {
                     await executionContext.interaction.showModal(executionContext.modal);
                     executionContext.messageSent = true;
                     executionContext.replied = true;
                 } catch (modalError) {
                     console.error(`CommandHandler: Failed to show modal for interaction ${executionContext.interaction.id}:`, modalError);
                      await handleExecutionError(executionContext, new Error("Failed to display the requested modal form."));
                 }
            }

            if (!executionContext.messageSent) {
                 const responsePayload = buildResponsePayload(executionContext);
                 await sendResponse(executionContext, responsePayload);
            } else {
                 if (!executionContext.finalResult && ( (executionContext.embedData && Object.keys(executionContext.embedData).length > 0) || executionContext.components?.length > 0 || executionContext.attachments?.length > 0)) {
                      const commandName = executionContext.command?.name || executionContext.eventData?.name || executionContext.eventName || 'unknown process';
                      console.warn(`CommandHandler: Embed/Component/Attachment data prepared for "${commandName}" but was ignored due to an earlier explicit message send, reply, or modal.`);
                 }
            }

        } catch (error) {
            await handleExecutionError(executionContext, error);
        } finally {
        }
    }
}

module.exports = CommandHandler;
