
﻿<div align='center'>

# <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Activity/Party%20Popper.webp" alt="Party Popper" width="35" height="35" /> Daily Dose of Leetcode <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Activity/Party%20Popper.webp" alt="Party Popper" width="35" height="35" />

![Discord](https://img.shields.io/badge/Discord-Bot-blue?logo=discord)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=jinx-vi-0.leetcode-discord-bot)
<br>
[![Invite Me](https://img.shields.io/badge/Invite%20Me-000000?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1260183706866552852&permissions=274878057472&integration_type=0&scope=bot)
[![Join Community](https://img.shields.io/badge/Join_Community-000000?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/Rxx6p5je)

<a href="https://www.producthunt.com/posts/ddol?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-ddol" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=497588&theme=light" alt="DDoL - Daily&#0032;Dose&#0032;of&#0032;Leetcode | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

</div>

## <img src="https://user-images.githubusercontent.com/74038190/216122041-518ac897-8d92-4c6b-9b3f-ca01dcaf38ee.png" width="30" /> Introduction

This Discord bot integrates with LeetCode to provide daily challenges, random problems, user information, and more. It uses `discord.js` to interact with the Discord API and `leetcode-query` to fetch data from LeetCode.

--- 

## ✨ Features

-   Daily LeetCode Challenge notification
-   Delivers a random LeetCode problem based on difficulty
-   Fetches user profile information
-   Displays user streak information
-   Provides a user-friendly help command

---

## 📒 Commands
The bot does not use the traditional message command approach; instead, it uses a slash command approach. This means that when you type `/`, you will see a list of available commands in the guild. The commands provided by this bot are:
- `/potd` - Shows the LeetCode Daily Challenge
- `/random <easy/medium/hard>` - Shows a random LeetCode problem
- `/user <username>` - Shows User Info
- `/streak <username>` - Shows user Streak Info
- `/help` - Shows help message
- `/topic` - Shows a list of LeetCode topics to choose from

---

## ⚙️ Installation 

1. 📂 Clone the repository:

    ```bash
    git clone https://github.com/your-github-username/leetcode-discord-bot.git
    ```

2. 📂 Navigate to the project directory:

    ```bash
    cd DDoL
    ```

3. 🛠 Install the dependencies:

    ```bash
    npm install
    ```

4. 🔐 Create a `.env` file in the root directory and add your Discord bot token and channel ID:

    ```plaintext
    TOKEN=your-discord-bot-token
    CHANNEL_ID=your-channel-id
    DEVELOPER_ID=your-discord-id
    ```

---

## 🛠️ How to Set Up a Bot on Discord

1. Create a new application
   Go to the [Discord Developer Portal](https://discord.com/developers/applications?new_application=true) and create a new application.

2. Configure `OAuth2` 🔑

3. In your app's settings, navigate to OAuth2.
   - Open the OAuth2 URL Generator and select the bot option.
   - Under Bot Permissions, select Administrator.
   - Set up the bot

4. Go to the `Bot` section and enable the following gateway intents:
   - `Server Members Intent`
   - `Message Content Intent`
   - Get your bot's `TOKEN` 🔐 and Create a Discord server

5. Create a new server in Discord and retrieve the `Channel ID` where your bot will operate.

---

## 🚀 Usage 

1. Start the bot 🤖:

    ```bash
    npm run start
    ```

2. Invite the bot to your Discord server using the OAuth2 URL generated from the Discord Developer Portal.

3. Use the commands in any channel the bot has access to.
4. Register slash commands in your guild using `;register guild <your server ID>`. Please don't provide the server ID if you want to register commands in your current guild.
5. If you want to register slash commands in all guilds, ignore the 4th step and run `;register global`
---

## ✨ Contributing 

Contributions are welcome! Please raise an issue with your changes.

### 🤝 How to Contribute
We appreciate your contributions! To get involved, follow these simple steps:

1. Fork the repository 🍴 <br>
   Make a personal copy of the repository.

2. Create a new branch 🌿 <br>
   Start working on your changes in a separate branch for better tracking.

3. Make your changes 🛠️ <br>
   Update the code, fix bugs, or add new features!

4. Commit and push your changes 💻 <br>
   Make sure to include a clear commit message explaining what you’ve done.

5. Submit a Pull Request (PR) 🪄 <br>
   Once you're ready, open a PR for review.

Done! ✅
That's it—thanks for contributing! We’ll review your PR as soon as possible.  

<br>

### ❤️ Our Valuable Contributors
[![Contributors](https://contrib.rocks/image?repo=jinx-vi-0/DDoL)](https://github.com/jinx-vi-0/DDoL/graphs/contributors)

---

## 🪄 License 

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

<h2 align="center">Don't forget to give us a ⭐</h2
