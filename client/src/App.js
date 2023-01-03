import React from "react";
import TerminalRender from "./components/Terminal";
import { useState, useEffect } from "react";
import AppContext from "./context/AppContext";
import dialogue from "./dialogue.json"

export default function App() {
  let [message, setMessage] = useState("");
  let [password, setPassword] = useState("");
  let [history, setHistory] = useState([dialogue.init]);
  let [inputHistory, setInputHistory] = useState([]);
  let [msgId, setMsgId] = useState("");
  let [reqMsgId, setReqMsgId] = useState("");
  let [errorResult, setErrorResult] = useState("")
  let [filesArr, setFilesArr] = useState([])
  let [fileId, setFileId] = useState("")
  let [reqFile, setReqFile] = useState("")
  let [fileURL, setFileURL] = useState("")

  

  let contextObj = {
    //CRUD Methods
    deleteFile,
    postMessage,
    getMessage,
    deleteMessage,
    editMessage,
    editPassword,

    message,
    setMessage,
    password,
    setPassword,
    history,
    setHistory,
    inputHistory,
    setInputHistory,
    msgId,
    setMsgId,
    reqMsgId,
    setReqMsgId,
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
        // setMessageResult(data.payload);
        setHistory((prevState) => [...prevState, { prompt: `Your message is: ${data.payload}. Exit the application or press [r] to return to the initial menu.`, inputHistory: ["viewMsgComplete"], validResponse: ["r"] }]);
        setPassword('');
        setReqMsgId('');
      })
      .catch(error => setErrorResult(error.message));
  }

  function getFileURL() {
    var myHeaders = new Headers();
    myHeaders.append("msg_id", reqFile);
    myHeaders.append("password", password);


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
    myHeaders.append("password", password);

    var requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      redirect: 'follow',
      mode: 'cors'
    };

    fetch("http://localhost:8080/message", requestOptions)
      .then(response => response.json())
      // .then(result => setMessageResult("Dead Drop Destroyed"))
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }

  function deleteFile() {
    var myHeaders = new Headers();
    myHeaders.append("title", reqMsgId);
    myHeaders.append("payload", "");
    myHeaders.append("password", password);
    myHeaders.append("action", "DELETE");
    
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
        setHistory((prevState) => [...prevState, { prompt: data.message + ` Exit the application or press [r] to return to the initial menu.`, inputHistory: ["deleteMsgComplete"], validResponse: ["r"] }]);
        setPassword('');
        setReqMsgId('');
      })
      .catch(error => setErrorResult(error.message));
  }

  function editMessage() {
    var myHeaders = new Headers();
    myHeaders.append("title", reqMsgId);
    myHeaders.append("payload", message);
    myHeaders.append("password", password);
    myHeaders.append("action", "MESSAGE");
    
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
        setHistory((prevState) => [...prevState, { prompt: `Your message has been updated. Exit the application or press [r] to return to the initial menu.`, inputHistory: ["editMsgComplete"], validResponse: ["r"] }]);
        setPassword('');
        setReqMsgId('');
      })
      .catch(error => setErrorResult(error.message));
  }

  function editPassword() {
    var myHeaders = new Headers();
    myHeaders.append("msg_id", reqMsgId);
    myHeaders.append("password", password);
    myHeaders.append("option", "pas");
    myHeaders.append("update", password);


    var requestOptions = {
      method: 'PATCH',
      headers: myHeaders,
      redirect: 'follow',
      mode: 'cors'
    };

    fetch("http://localhost:8080/message", requestOptions)
      .then(response => response.json())
      // .then(result => setMessageResult("Updated"))
      .then(result => console.log("Updated"))
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
