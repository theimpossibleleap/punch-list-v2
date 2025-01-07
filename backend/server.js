// Import all dependencies.
// Express for the API, cors to handle any cors handling, bodyParser to parse JSON res/req, and sequelize to handle ORM for the sqlite3 database used for storage.
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { DataTypes, Model, Sequelize } from "sequelize";

// Define the sequelize instance using sqlite and giving the path to the DB.
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

// Define class and extend using the Sequelize Model to handle ORM for the database. This also names the table and adds a createdAt column for easy timestamps.
class Task extends Model {}
Task.init(
  {
    task: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    complete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
    createdAt: true,
  },
);

// The sync command initializes the database with the configuration above. In this case, it truncates and deletes all previous records on init, resets the id column so the next ID is 1, and creates a task to bootstrap data to the application.
{
  /*
sequelize
  .sync()
  .then(() => {
    Task.truncate();
    sequelize.query("DELETE FROM sqlite_sequence where name='tasks'");
  })
  .then(() => {
    Task.create({
      task: "This is the first task!",
    });
  });
  */
}

// Initialize and start the database.
sequelize.sync();

// Defines the express instance and port number to be used.
const app = express();
const port = 3000;

// Tells the express instance to use cors, bodyParser, and in case, the express.json dependence as well.
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// Index Endpoint that just returns a title for now.
app.get("/", (req, res) => {
  res.json({
    text: "Hello, Tasks.",
  });
});

// Task endpoint that returns a list of all tasks to the front end.
app.get("/tasks", async (req, res) => {
  const tasks = await Task.findAll({
    where: {
      complete: false,
    },
  });
  res.send(tasks);
});

// Complete endpoint that pulls only tasks that are complete: true.
app.get("/tasks/complete", async (req, res) => {
  const tasks = await Task.findAll({
    where: {
      complete: true,
    },
  });
  res.send(tasks);
});

// Post endpoint to add new tasks to the database.
app.post("/tasks", (req, res) => {
  const receivedJson = req.body;
  Task.create(receivedJson);
  res.send("Task added successfully!");
});

// Post endpoint to add new tasks to the database.
app.put("/tasks", (req, res) => {
  const receivedJson = req.body;
  Task.update(
    { task: receivedJson.task },
    {
      where: {
        id: receivedJson.id,
      },
    },
  );
  res.send("Task edited successfully!");
});

// Put endpoint to mark tasks as complete.
app.put("/tasks/complete", (req, res) => {
  const receivedJson = req.body;
  Task.update(
    { complete: receivedJson.complete },
    {
      where: {
        id: receivedJson.id,
      },
    },
  );
  res.send("Task complete.");
});

// Delete endpoint to delete a task from the compeleted list.
app.delete("/tasks/delete/:id", async (req, res) => {
  const resourceId = req.params.id;
  Task.destroy({
    where: {
      id: resourceId,
    },
  });
  res.send("Successfully deleted.");
});

// Delete endpoint to clear ALL completed tasks.
app.delete("/tasks/clear", async (req, res) => {
  Task.destroy({
    where: {
      complete: true,
    },
  });

  res.send("Completed tasks cleared.");
});

// Initialize the express server on the assigned port, console log a message for successful starting of server.
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
