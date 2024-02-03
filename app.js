const fs = require("fs/promises");
(async () => {
  const openFile = await fs.open("./command.txt");

  const CREATE_FILE = "create a file";

  const DELETE_FILE = "delete a file";
  const RENAME_FILE = "rename a file";
  const ADD_TO_FILE = "add to the file";

  const createFileFunc = async (filePath) => {
    try {
      const existingFile = await fs.open(filePath, "r");

      // If this line execute mean we already have a file otherwise it execute code in catch function
      console.log(`file path ${filePath} already exist`);
      existingFile.close();
    } catch (e) {
      const newFile = await fs.open(filePath, "w");
      console.log("New file created successfully");
      newFile.close();
    }
  };
  const deleteFileFunc = async (filePath) => {
    try {
      const file = await fs.unlink(filePath);
      console.log("File deleted successfully");
    } catch (e) {
      console.log(e.message);
    }
  };
  const renameFile = async (oldPath, newPath) => {
    try {
      const renamedFile = await fs.rename(oldPath, newPath);
      console.log(`File ${oldPath} renamed to ${newPath}`);
    } catch (e) {
      console.log("error", e.message);
    }
  };

  const addToFile = async (filePath, body) => {
    try {
      const writeFile = await fs.writeFile(filePath, body);
      console.log(`Adding to file ${filePath} content ${body}`);
    } catch (error) {
      console.log("error", e.message);
    }
  };

  openFile.on("change", async () => {
    //The size we need to for our file to read
    const size = (await openFile.stat()).size;

    // allocate our buffer with the size of the file
    const buff = Buffer.alloc(size);

    // the location at which we start filling the buffer
    const offset = 0;

    // how many bytes we want to read
    const length = buff.byteLength;

    // the position that we want to start reading from
    const position = 0;

    // we always want to read the whole file (from start to end)
    await openFile.read(buff, offset, length, position);
    const command = buff.toString();

    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length + 1);
      createFileFunc(filePath);
    }

    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFileFunc(filePath);
    }
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldPath = command.substring(RENAME_FILE.length + 1, _idx);
      const newPath = command.substring(_idx + 4);

      renameFile(oldPath, newPath);
    }
    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(" content: ");
      const filePath = command.substring(ADD_TO_FILE.length + 1, _idx);
      const body = command.substring(_idx + 10);
      addToFile(filePath, body);
    }
  });

  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      openFile.emit("change");
    }
  }
})();
