import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// Function to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load commands from a specific folder recursively
export function loadCommandsFromFolder(client, folderPath) {
  console.log(`Loading commands from ${folderPath}...`);

  if (!fs.existsSync(folderPath)) {
    console.log(`Folder ${folderPath} does not exist.`);
    return;
  }

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      // If it's a directory, recursively load commands from it
      loadCommandsFromFolder(client, filePath);
    } else if (file.endsWith(".mjs")) {
      // Dynamically import JavaScript files and add the command
      const fileURL = pathToFileURL(filePath); // Convert to URL for ES module import
      import(fileURL.href)
        .then((commands) => {
          const command = commands.default;
          if (command.name && command.description && command.execute) {
            client.commands.set(command.name, command);
            console.log(`Command added: ${command.name}`);
          }
        })
        .catch((err) => {
          console.error(`Error loading command ${filePath}:`, err);
        });
    }
  }
}

// Function to load all the commands from multiple folders recursively
export function loadCommands(client) {
  const commandsPath = path.join(__dirname, "commands");
  loadCommandsFromFolder(client, commandsPath);
}
