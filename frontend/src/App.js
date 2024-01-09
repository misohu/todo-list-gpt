import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file

const TodoForm = ({ addTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/todos', {
        title,
        description,
      });
      addTodo(response.data);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <br />
      <label>
        Description:
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <br />
      <button type="submit">Add Todo</button>
    </form>
  );
};

const TodoList = ({ todos, deleteTodo }) => (
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Description</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {todos.map((todo) => (
        <tr key={todo.id}>
          <td>{todo.id}</td>
          <td>{todo.title}</td>
          <td>{todo.description}</td>
          <td>
            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const App = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/todos');
        setTodos(response.data);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchData();
  }, []);

  const addTodo = (todo) => {
    setTodos([...todos, todo]);
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="container">
      <h1>Todo List</h1>
      <TodoForm addTodo={addTodo} />
      <TodoList todos={todos} deleteTodo={deleteTodo} />
    </div>
  );
};

export default App;
