import { useState } from "react";
import { useEffect } from "react";
import {
  ArrowCounterclockwise,
  CheckSquare,
  PencilSquare,
  XLg,
} from "react-bootstrap-icons";
import Markdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";

function App() {
  // useState definitions to store tasks from endpoint, complete tasks, and edit tasks.
  const [hello, setHello] = useState("");
  const [tasks, setTasks] = useState([]);
  const [complete, setComplete] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [editTaskId, setEditTaskId] = useState("");
  const [editTask, setEditTask] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  // Testing for text beyond whitespace in the textarea of new tasks / edit tasks.
  const hasValidText = (text) => /\S/.test(text);

  // baseUrl for Endpoint
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // useEffect to load and render index endpoint on component initialization. Just returns "Hello, Tasks." from the API.
  useEffect(() => {
    fetch(import.meta.env.VITE_BASE_URL)
      .then((response) => response.json())
      .then((data) => setHello(data))
      .catch((err) => console.error(err));
  }, []);

  // Function to fetch task list from the API. This is called upon initialization through the useEffect hook below as well as on add or delete.
  const handleFetch = async () => {
    await fetch(import.meta.env.VITE_BASE_URL + "/tasks")
      .then((response) => response.json())
      .then((data) => {
        setTasks(data);
      })
      .catch((err) => console.error(err));

    await fetch(import.meta.env.VITE_BASE_URL + "/tasks/complete")
      .then((response) => response.json())
      .then((data) => {
        const sortedData = [...data].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        );
        setComplete(sortedData);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    handleFetch();
  }, []);

  // Function to add a new task to the task list using the post endpoint of the express server.
  const handleAdd = async () => {
    await fetch(import.meta.env.VITE_BASE_URL + "/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task: taskText }),
    })
      .then(() => {
        handleFetch();
      })
      .then(() => {
        setTaskText("");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleKeyDown = (e) => {
    e.key === "Enter" &&
    hasValidText(taskText) &&
    taskText &&
    !e.shiftKey &&
    !e.ctrlKey &&
    !e.altKey &&
    !e.metaKey
      ? handleAdd()
      : null;
  };

  // Function to delete a task from the task list using the delete endpoint of the express server.
  const handleDelete = (idToDelete) => {
    const id = idToDelete;

    fetch(import.meta.env.VITE_BASE_URL + `/tasks/delete/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        handleFetch();
      })
      .catch((err) => console.error(err));
  };

  // Clear completed list
  const handleClear = () => {
    fetch(import.meta.env.VITE_BASE_URL + "/tasks/clear", {
      method: "DELETE",
    })
      .then(() => {
        handleFetch();
      })
      .catch((err) => console.error(err));
  };

  // Mark as complete
  const handleComplete = async (completeId, isComplete) => {
    const toggleComplete = !isComplete;

    await fetch(import.meta.env.VITE_BASE_URL + "/tasks/complete", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: completeId, complete: toggleComplete }),
    })
      .then(() => {
        handleFetch();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const EditTask = ({ editTaskId, editTask }) => {
    const [editNewTask, setEditNewTask] = useState(editTask);

    const handleEdit = async () => {
      await fetch(import.meta.env.VITE_BASE_URL + "/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: editTaskId, task: editNewTask }),
      })
        .then(() => {
          handleFetch();
        })
        .then(() => {
          setShowEdit(!showEdit);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    return (
      <>
        <div className="absolute top-0 left-0 z-[100] w-full min-h-screen dark:bg-gray-950/50 backdrop-blur dark:text-white flex justify-center pt-16">
          <div className="w-2/3 max-w-[550px] h-fit flex flex-col justify-between bg-zinc-100 dark:bg-gray-950 p-4 border border-gray-800">
            <div className="flex justify-between mb-6">
              <div>Edit Task</div>
              <div
                onClick={() => {
                  setShowEdit(!showEdit);
                }}
              >
                <div className="bg-white border border-black/20 hover:bg-black/10 rounded-[50%] w-6 h-6 flex items-center justify-center transition">
                  <XLg color={"rgba(0,0,0,0.8)"} />
                </div>
              </div>
            </div>
            <div className="w-full">
              <textarea
                className="w-full h-[200px] appearance-none dark:bg-gray-950 border border-zinc-400 dark:border-gray-700 p-4"
                value={editNewTask}
                onChange={(e) => setEditNewTask(e.target.value)}
              />
              <button
                className="float-end appearance-none bg-white hover:text-white hover:bg-emerald-500 dark:bg-gray-800 border border-zinc-400 hover:border-zinc-600 dark:border-gray-700 py-1 px-2 hover:dark:border-gray-400 mt-2"
                onClick={handleEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div
        id="page-container"
        className="w-full h-fit min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-300 dark:from-gray-800 dark:to-gray-950 dark:text-white flex flex-col items-center pt-6 sm:pt-12 pb-6 sm:pb-12 font-mono text-sm"
      >
        <div id="div-container" className="w-11/12 sm:w-5/6 max-w-[900px]">
          {showEdit ? (
            <EditTask editTaskId={editTaskId} editTask={editTask} />
          ) : null}
          <div className="mb-2 font-bold text-emerald-500">Punch List v2</div>
          <div className="text-4xl mb-6 font-thin font-sans">{hello.text}</div>
          <div className="flex flex-col sm:flex-row">
            <textarea
              rows={8}
              placeholder="What'll it be?"
              value={taskText}
              className="appearance-none dark:bg-gray-950 border border-zinc-400 dark:border-gray-700 py-1 px-2 mb-2 sm:mb-0 sm:mr-6 flex-1 min-h-[35px] resize-none"
              onChange={(e) => setTaskText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              disabled={!hasValidText(taskText)}
              onClick={handleAdd}
              className={`flex max-h-[35px] appearance-none bg-white dark:bg-gray-800 border border-zinc-400 dark:border-gray-700 py-1 px-2 justify-center items-center sm:mr-2 mb-2 sm:mb-0 ${!hasValidText(taskText) ? "bg-white text-zinc-400 dark:text-zinc-500" : "hover:text-white hover:bg-emerald-500 hover:border-zinc-600 hover:dark:border-gray-400"}`}
            >
              Add Task
            </button>
            <button
              onClick={handleClear}
              disabled={complete.length === 0}
              className={`flex max-h-[35px] appearance-none bg-white dark:bg-gray-800 border border-zinc-400 dark:border-gray-700 py-1 px-2 justify-center items-center ${complete.length === 0 ? "bg-white text-zinc-400 dark:text-zinc-500" : "hover:text-white hover:bg-emerald-500 hover:border-zinc-600 hover:dark:border-gray-400"}`}
            >
              Clear Completed
            </button>
          </div>
          <div className="border-b dark:border-gray-700 my-12"></div>
          <ul className="flex flex-col h-1/3">
            <div className="mb-4 text-lg uppercase">Pending Tasks</div>
            {tasks.length === 0 ? (
              <div className="w-full flex items-center text-lg font-thin font-sans">
                Nada! 🎉
              </div>
            ) : (
              tasks.map((task, index) => {
                return (
                  <li
                    key={uuidv4()}
                    className="bg-zinc-100 flex justify-between mb-2 dark:bg-gray-800 border border-zinc-400 dark:border-gray-700 font-sans p-2"
                  >
                    <div className="flex">
                      <p className="ml-2 mr-4 flex justify-center font-bold">
                        {index + 1}.
                      </p>
                      <Markdown className={"markdown"}>{task.task}</Markdown>
                    </div>
                    <div className="ml-1 sm:ml-20 min-w-32 flex justify-end">
                      <button
                        className="mr-2 h-fit border border-zinc-400 bg-white hover:bg-emerald-500 hover:text-white dark:border-gray-500 px-4 py-1 dark:bg-gray-600 hover:dark:border-gray-900"
                        onClick={() => {
                          setEditTaskId(task.id);
                          setEditTask(task.task);
                          setShowEdit(true);
                        }}
                      >
                        <PencilSquare size={14} />
                      </button>
                      <button
                        className="h-fit border border-zinc-400 bg-white hover:bg-emerald-500 hover:text-white dark:border-gray-500 px-4 py-1 dark:bg-gray-600 hover:dark:border-gray-900"
                        onClick={() => handleComplete(task.id, task.complete)}
                      >
                        <CheckSquare size={14} />
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
          <div className="border-b dark:border-gray-700 my-12"></div>
          <ul className="flex flex-col mb-6 h-1/3">
            {complete.length === 0 ? (
              ""
            ) : (
              <div className="mb-4 text-lg uppercase">Completed Tasks</div>
            )}
            {complete.length === 0
              ? null
              : complete.map((task, index) => {
                  return (
                    <li
                      key={uuidv4()}
                      className="bg-zinc-100 flex justify-between mb-2 dark:bg-gray-800 border border-zinc-400 dark:border-gray-700 font-sans p-2"
                    >
                      <div className="flex line-through text-zinc-400 dark:text-gray-500">
                        <p className="mr-2 min-w-12 flex justify-center font-bold">
                          {index + 1}.
                        </p>
                        <Markdown className={"markdown"}>{task.task}</Markdown>
                      </div>
                      <div className="ml-1 sm:ml-20 min-w-32 flex justify-end">
                        <button
                          className="mr-2 h-fit border border-zinc-400 bg-white hover:bg-emerald-500 hover:text-white dark:border-gray-500 px-4 py-1 dark:bg-gray-600 hover:dark:border-gray-900"
                          onClick={() => handleComplete(task.id, task.complete)}
                        >
                          <ArrowCounterclockwise size={14} />
                        </button>
                        <button
                          className="h-fit border border-zinc-400 bg-white hover:bg-emerald-500 hover:text-white dark:border-gray-500 px-4 py-1 dark:bg-gray-600 hover:dark:border-gray-900"
                          onClick={() => handleDelete(task.id)}
                        >
                          <XLg size={14} />
                        </button>
                      </div>
                    </li>
                  );
                })}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
