const Discord = require("discord.js")
const client = new Discord.Client()

client.on("guildCreate", function(guild) {
  if (guild.available) {
    guild.channels.create("Private Roomz", {
      type: "category"
    }).then(function(channel) {
      guild.channels.create("roomz-commands",{
        type: "text",
        parent: channel
      }).then(function(howToChannel) {
        howToChannel.send("To create a private voice room, type `roomz create` followed by the @ mentions of the users and/or roles you want to allow into your private room. If I react with ✅, I've created the channel. If I react with ❌, I was unable to create the channel or complete your request.\n\nFor the rest of the commands, type `roomz help` and you will be DM'd the commands.")
      })
    })
    guild.owner.send("Thanks for adding roomz to your server! Here\'s just a few things you need to know about roomz:\n\n- I create private voice channels. The voice channels will be placed in the `Private Roomz` category that I created.\n- Make sure there\'s always a category called `Private Roomz`. If there isn\'t, I'll make one.\n- I will only act on commands sent in the #roomz-commands channel.\n\nI hope you enjoy roomz!")
  }
})

client.on("message", function(message) {
  if (!message.author.bot) {
    if (message.guild) {
      if (message.content.startsWith("roomz ") && message.channel.name == "roomz-commands") {
        let params = message.content.substring(6).split(" ")
        for (var i = 0; i < params.length; i++) {
          params[i] = params[i].toLowerCase()
        }
        if (params[0] == "create" || params[0] == "new") {
          message.guild.fetch().then(function(fetchedGuild) {
            let category = fetchedGuild.channels.cache.find(channel => channel.name == "Private Roomz" && channel.type == "category")
            if (category) {
              let roomName = message.author.username + "#" + message.author.discriminator + "\'s room"
              if (category.children.find(channel => channel.name == roomName)) {
                message.react('❌')
              } else {
                let permissionOverwrites = [{
                  id: fetchedGuild.roles.everyone,
                  deny: "CONNECT",
                  type: "role"
                },{
                  id: message.member,
                  allow: "CONNECT",
                  type: "member"
                }]
                for (var i = 0; i < message.mentions.members.array().length; i++) {
                  permissionOverwrites.push({
                    id: message.mentions.members.array()[i],
                    allow: "CONNECT",
                    type: "member"
                  })
                }
                for (var i = 0; i < message.mentions.roles.array().length; i++) {
                  permissionOverwrites.push({
                    id: message.mentions.roles.array()[i],
                    allow: "CONNECT",
                    type: "role"
                  })
                }
                fetchedGuild.channels.create(roomName, {
                  type: "voice",
                  parent: category,
                  permissionOverwrites: permissionOverwrites
                }).then(function(newChannel) {
                  message.react('✅')
                })
              }
            } else {
              categoryNotFound(fetchedGuild, message)
            }
          })
        } else if (params[0] == "add" || params[0] == "allow" || params[0] == "accept" || params[0] == "invite") {
          message.guild.fetch().then(function(fetchedGuild) {
            let category = fetchedGuild.channels.cache.find(channel => channel.name == "Private Roomz" && channel.type == "category")
            if (category) {
              let roomName = message.author.username + "#" + message.author.discriminator + "\'s room"
              let channel = category.children.find(channel => channel.name == roomName)
              if (channel) {
                for (var i = 0; i < message.mentions.members.array().length; i++) {
                  channel.createOverwrite(message.mentions.members.array()[i], { "CONNECT": true }, "roomz permissions")
                }
                for (var i = 0; i < message.mentions.roles.array().length; i++) {
                  channel.createOverwrite(message.mentions.roles.array()[i], { "CONNECT": true }, "roomz permissions")
                }
                message.react('✅')
              } else {
                message.react('❌')
              }
            } else {
              categoryNotFound(fetchedGuild, message)
            }
          })
        } else if (params[0] == "delete" || params[0] == "remove" || params[0] == "deny" || params[0] == "destroy" || params[0] == "reject") {
          message.guild.fetch().then(function(fetchedGuild) {
            let category = fetchedGuild.channels.cache.find(channel => channel.name == "Private Roomz" && channel.type == "category")
            if (category) {
              let roomName = message.author.username + "#" + message.author.discriminator + "\'s room"
              let channel = category.children.find(channel => channel.name == roomName)
              if (channel) {
                for (var i = 0; i < message.mentions.members.array().length; i++) {
                  channel.createOverwrite(message.mentions.members.array()[i], { "CONNECT": null }, "roomz permissions")
                }
                for (var i = 0; i < message.mentions.roles.array().length; i++) {
                  channel.createOverwrite(message.mentions.roles.array()[i], { "CONNECT": null }, "roomz permissions")
                }
                message.react('✅')
              } else {
                message.react('❌')
              }
            } else {
              categoryNotFound(fetchedGuild, message)
            }
          })
        } else if (params[0] == "help" || params[0] == "what" || params[0] == "how") {
          message.member.send("**roomz commands**\n\n`roomz create [mentions]` - Create a private voice channel and give access to the members and roles you mention.\n`roomz add [mentions]` - Give access to the members and roles you mention to your private voice channel.\n`roomz remove [mentions]` - Revoke access to the members and roles you mention to your private voice channel.\n\nIf I react to your command with ✅, then I've completed the request. If I react with ❌, then I was unable to complete your request. Check with the moderators of the server to make sure I have the necessary permissions.")
          message.delete()
        }
      }
    } else {
      message.reply("Commands must be sent in the #roomz-commands channel of a server that I am in.")
    }
  }
})

function categoryNotFound(guild, message) {
  guild.channels.create("Private Roomz", {
    type: "category"
  }).then(function(channel) {
    guild.channels.create("roomz-commands",{
      type: "text",
      parent: channel
    }).then(function(howToChannel) {
      howToChannel.send("To create a private voice room, type `roomz create` followed by the @ mentions of the users and/or roles you want to allow into your private room. If I react with ✅, I've created the channel. If I react with ❌, you already have a private channel.\n\nFor the rest of the commands, type `roomz help` and you will be DM'd the commands.")
    })
  })
  message.react('❌')
}

client.login("NzIyNTM3MjMwMDE4Njc0NzQx.XukmeQ.bajRs72up9s9SAPD8_fwyYlpxfw")
