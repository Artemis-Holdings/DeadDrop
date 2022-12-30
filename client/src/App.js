import React from "react";
import TerminalRender from "./components/Terminal2";
import { useState, useEffect } from "react";
import AppContext from "./context/AppContext";

export default function App() {

  // States for API
  let [message, setMessage] = useState("");
  let [password, setPassword] = useState("");
  let [count, setCount] = useState(0);
  let [rerender, setRerender] = useState(false);
  let [history, setHistory] = useState([]);
  let [response, setResponse] = useState("");
  let [inputHistory, setInputHistory] = useState([]);
  let [passwordInput, setPasswordInput] = useState("text")
  let [msgId, setMsgId] = useState("");
  //let [update, setUpdate] = useState("");
  let [reqMsgId, setReqMsgId] = useState("");
  let [reqPassword, setReqPassword] = useState("");
  let [messageResult, setMessageResult] = useState("");
  let [updatedMessage, setUpdatedMessage] = useState("");
  let [updatedPassword, setUpdatedPassword] = useState("")
  let [errorResult, setErrorResult] = useState("")
  let [filesArr, setFilesArr] = useState([])
  let [fileId, setFileId] = useState("")
  let [reqFile, setReqFile] = useState("")
  let [fileURL, setFileURL] = useState("")

  let contextObj = {
    message,
    setMessage,
    password,
    setPassword,
    count,
    setCount,
    rerender,
    setRerender,
    history,
    setHistory,
    postMessage,
    response,
    setResponse,
    inputHistory,
    setInputHistory,
    getMessage,
    msgId,
    setMsgId,
    reqMsgId,
    setReqMsgId,
    reqPassword,
    setReqPassword,
    passwordInput,
    setPasswordInput,
    messageResult,
    setMessageResult,
    deleteMessage,
    editMessage,
    updatedMessage,
    setUpdatedMessage,
    editPassword,
    updatedPassword,
    setUpdatedPassword,
    errorResult,
    setErrorResult,
    filesArr,
    setFilesArr,
    fileId,
    setFileId,
    postFile,
    reqFile,
    setReqFile,
    fileURL,
    setFileURL,
    deleteFile,
    getFileURL
  };

  function postMessage() {
    var myHeaders = new Headers();
    myHeaders.append("title", "Hello World");
    myHeaders.append("payload", message);
    myHeaders.append("password", password);
    myHeaders.append("action", "WRITE");
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch("http://localhost:8080", requestOptions)
      .then(response => response.json())
      .then(data => {
        setMsgId(data.title);
        setPassword('');
      })
      .catch(error => setErrorResult("An error has occurred, please refresh the page and try again."));
  }

  function postFile() {
    var myHeaders = new Headers();
    myHeaders.append("password", password);

    var formdata = new FormData();
    formdata.append("input", filesArr[0], filesArr[0].name);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow'
    };

    fetch("http://localhost:8080/file", requestOptions)
      .then(response => response.json())

      .then(data => setFileId(data["msg_id"]))
      .catch(error => console.log('error', error));
  }

  useEffect(() => {
    console.log('password: ', password)
  }, [password])

  function getMessage() {
    var myHeaders = new Headers();
    myHeaders.append("title", reqMsgId);
    myHeaders.append("payload", "");
    myHeaders.append("password", password);
    myHeaders.append("action", "READ");
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch("http://localhost:8080", requestOptions)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        return response.json().then((data) => {
          throw new Error(data.message);
        })
      })
      .then(data => {
        setMessageResult(data.payload);
        console.log('data: ', data.payload);
        setPassword('');
        setReqMsgId('');
      })
      .catch(error => setErrorResult(error.message));
  }

  function getFileURL() {
    var myHeaders = new Headers();
    myHeaders.append("msg_id", reqFile);
    myHeaders.append("password", reqPassword);


    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      mode: 'cors'
    };

    fetch("http://localhost:8080/file", requestOptions)
      .then(response => response.json())
      .then(result => setFileURL(result.uriArray[0]))
      .catch(error => setErrorResult("Your message ID or password were incorrect, please try again"));
  }

  function deleteMessage() {
    var myHeaders = new Headers();
    myHeaders.append("msg_id", reqMsgId);
    myHeaders.append("password", reqPassword);

    var requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      redirect: 'follow',
      mode: 'cors'
    };

    fetch("http://localhost:8080/message", requestOptions)
      .then(response => response.json())
      .then(result => setMessageResult("Dead Drop Destroyed"))
      .catch(error => console.log('error', error));
  }

  function deleteFile() {
    var myHeaders = new Headers();
    myHeaders.append("msg_id", reqFile);
    myHeaders.append("password", reqPassword);

    var requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      redirect: 'follow',
      mode: 'cors'
    };

    fetch("http://localhost:8080/file", requestOptions)
      .then(response => response.json())
      .then(result => setMessageResult("Dead Drop Destroyed"))
      .catch(error => console.log('error', error));
  }

  function editMessage() {
    var myHeaders = new Headers();
    myHeaders.append("msg_id", reqMsgId);
    myHeaders.append("password", reqPassword);
    myHeaders.append("option", "msg");
    myHeaders.append("update", updatedMessage);


    var requestOptions = {
      method: 'PATCH',
      headers: myHeaders,
      redirect: 'follow',
      mode: 'cors'
    };

    fetch("http://localhost:8080/message", requestOptions)
      .then(response => response.json())
      .then(result => setMessageResult("Dead Drop Updated"))
      .catch(error => console.log('error', error));
  }

  function editPassword() {
    var myHeaders = new Headers();
    myHeaders.append("msg_id", reqMsgId);
    myHeaders.append("password", reqPassword);
    myHeaders.append("option", "pas");
    myHeaders.append("update", updatedPassword);


    var requestOptions = {
      method: 'PATCH',
      headers: myHeaders,
      redirect: 'follow',
      mode: 'cors'
    };

    fetch("http://localhost:8080/message", requestOptions)
      .then(response => response.json())
      .then(result => setMessageResult("Updated"))
      .catch(error => console.log('error', error));
  }

  return (
    <AppContext.Provider value={contextObj}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#282c34",
        }}
      >
        <TerminalRender />
      </div>
    </AppContext.Provider>
  );
}
