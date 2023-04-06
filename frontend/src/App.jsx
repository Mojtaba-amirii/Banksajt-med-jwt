import { useState } from "react";
import Login from "./Login";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState("");

  function handleRegister() {
    const user = {
      username: username,
      password: password,
      amount: amount,
    };
    console.log("user: ", user);

    fetch("http://localhost:4001/users", {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => console.log("got response", res))
      .then((data) => console.log(data));
  }

  return (
    <div className="App">
      <h2>Register</h2>
      <label> username </label>
      <input type="text" onChange={(e) => setUsername(e.target.value)} />
      <label>password</label>
      <input type="text" onChange={(e) => setPassword(e.target.value)} />
      <br />
      <label>amount</label>
      <input type="text" onChange={(e) => setAmount(e.target.value)} />
      <button onClick={handleRegister}> Register here!</button>
      <Login />
    </div>
  );
}

export default App;
