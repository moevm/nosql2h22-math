import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState({
    first:"",
    second:"",
    third:""
  });
  useEffect(() => {
    fetch("http://localhost:8000/students")
      .then((res) => res.json())
      .then(
        (result) => {
          setData(result);
        },
        (error) => {}
      );
  }, []);

  return (
    <div className="App">
       <ul>
          <li>
           first = {data.first}
          </li>
          second = {data.second}
          <li>
          third  = {data.third}
          </li>
      </ul>
    </div>
  );
}

export default App;
