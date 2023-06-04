import AppContext from "../context/AppContext";
import { useContext, useEffect } from "react";
import "./Terminal.css";

export default function TerminalRender() {
  let {
    setMessage,
    setPassword,
    history,
    setHistory,
    postMessage,
    response,
    setResponse,
    inputHistory,
    setInputHistory,
    msgId, 
    reqMessage,
    setReqMessage,
    setReqPassword,
    passwordInput,
    setPasswordInput,
    getMessage,
    messageResult,
    editMessage,
    setUpdatedMessage,
    setUpdatedPassword,
    editPassword,
    deleteMessage,
    errorResult,
    filesArr,
    setFilesArr,
    postFile,
    fileId,
    setReqFile,
    fileURL,
    rerender,
    deleteFile,
    getFileURL
  } = useContext(AppContext);

  const prompt = "user@dead-drop ~ % "
  
  function historyUpdater(e, input) {
    if (!inputHistory.includes(input)) {
      setHistory([...history, response, prompt + e.target.value])
      setInputHistory([...inputHistory, input])
      e.target.value = ''
    }
    else {
    
    }
  }

  function handleCommands(e) {
    let val = e.target.value

    if (e.key === "Enter") {
      // ## MESSAGE ## Takes user down message path
      if (val === "m") {
        historyUpdater(e, "m")
        setResponse("Would you like to...\n[n] Make a new message.\n[v] View a message.\n [e] Edit a message.\n[c] Change your password.\n[d] Delete a message.")
      }
      
      // ## FILE ## Takes user down file path
      else if (val === "f") {
        historyUpdater(e, "f")
        setResponse("Would you like to [u] Upload a new file. [v] View a file. [d] Delete a file")
      }

      // ################### File HANDLING ###################

      // ## NEW FILE ## Prompts user to upload a file
      else if (val === "u" && inputHistory.includes("f")) {
        historyUpdater(e, "fu")
        //setResponse("Choose a file...")
        const input = document.createElement('input')
        input.type = 'file'

        input.onchange = e => {
          //console.log("E.TARGET.FILES: ", e.target.files)
          setFilesArr([...filesArr, e.target.files[0]])
        }
        input.click();
        filesArr.length === 0 ? setResponse("Choose a file...") : setResponse("Your file is staged, now enter your desired password")
        setPasswordInput("password")
      }

      // ## NEW FILE ## After typing their message, user then types their password to be stored
      else if (inputHistory.includes("fu") && !inputHistory.includes("fpw")) {
        setHistory([...history, response, prompt + "*".repeat(val.length)])
        setInputHistory([...inputHistory, "fpw"])
        e.target.value = ''      
        setPassword(val)
        setPasswordInput("text")
        setResponse(`Your password is set, type [s] to send your dead-drop`)    
      } 

      // ## NEW FILE ## Submits the file and posts it to server...
      else if (val === "s" && inputHistory.includes('fu') && inputHistory.includes("fpw"))  {
        historyUpdater(e, "fs")
        postFile()
        setResponse("Sending file to a secure and encrypted database...")
      }

      // ## VIEW FILE ## After selecting file, the user selects v to view a file
      else if (val === "v" && inputHistory.includes('f')) {
        historyUpdater(e, "fv")
        setResponse("Please input the file ID of the file you would like to view")
      }

      // ## VIEW FILE ## After typing the message id, the user is prompted to put input the password
      else if (inputHistory.includes('f') && inputHistory.includes('fv') && !inputHistory.includes('reqFile')) {
        historyUpdater(e, "reqFile")
        setReqFile(val)
        setPasswordInput("password")
        setResponse("Your file has been staged for viewing, please input the correct password")
      }

      // ## VIEW FILE ## After typing the password, the user is prompted to submit the command
      else if (inputHistory.includes('fv') && inputHistory.includes('reqFile') && !inputHistory.includes("reqFilePw")) {
        setHistory([...history, response, prompt + "*".repeat(val.length)])
        setInputHistory([...inputHistory, "reqFilePw"])
        e.target.value = ''
        setReqPassword(val)
        setPasswordInput("text")
        setResponse("Your password is set, type [s] to view the dead-drop file")
      }

      // ## VIEW ## After inputing their message password, the user submits the payload to the db
      else if (val === "s" && inputHistory.includes("fv") && inputHistory.includes('reqFilePw') && !inputHistory.includes('reqFileSent')) {
        getFileURL()
        historyUpdater(e, "reqFileSent")
        setResponse("Decrypting file...")
      }

      // ## DELETE FILE ## After selecting f for file, the user chooses d to delete a message
      else if (val === "d" && inputHistory.includes("f")) {
        //historyUpdater(e, "fd")
        //setResponse("Please input the ID of the file you would like to delete")
        setHistory([...history, response, prompt + val])
        e.target.value = ''
        setResponse("The delete functionality is not supported yet. Press [r] to return to the main menu or exit the application")
      }

      // ## DELETE FILE ## After typing the file ID, the user is prompted to input the password
      else if (inputHistory.includes('f') && inputHistory.includes('fd') && !inputHistory.includes('reqFile')) {
        historyUpdater(e, "reqFile")
        setReqFile(val)
        setPasswordInput("password")
        setResponse("Your file has been staged for deletion, please input the correct password")
      }

      // ## DELETE FILE ## After typing the password, the user is prompted to submit the command
      else if (inputHistory.includes('fd') && inputHistory.includes('reqFile') && !inputHistory.includes('reqFilePw')) {
        setHistory([...history, response, prompt + "*".repeat(val.length)])
        setInputHistory([...inputHistory, "reqFilePw"])
        e.target.value = ''
        setReqPassword(val)
        setPasswordInput("text")
        setResponse("Your password is set, type [s] to delete the dead-drop file")
      }

      // ## DELETE FILE ## After inputing the message id, the system deletes the message and tells the user
      else if (inputHistory.includes("f") && inputHistory.includes("fd")) {
        deleteFile()
        historyUpdater(e, "reqFileSent")
        setResponse("Deleting...")
        // setResponse(`Your message with id: ${msgID} has been deleted. Exit the application or press [r] to return to the initial menu.`)
      }

      // ################### MESSAGE HANDLING ###################

      // ## NEW ## After selecting messages, user selects n for new message
      else if (val === "n" && inputHistory.includes("m")) {
        historyUpdater(e, "n")
        setResponse("Please type your desired message")
      }

      // ## NEW ## After selecting mesages, and new message, user types their message to be posted
      else if (inputHistory.includes("m") && inputHistory.includes("n") && !inputHistory.includes("msg")) {
        historyUpdater(e, "msg")
        setMessage(val)
        setPasswordInput("password")
        setResponse("Your message has been staged, now enter your desired password")
      }

      // ## NEW ## After typing their message, user then types their password to be stored
      else if (inputHistory.includes("msg") && !inputHistory.includes("pw")) {
        setHistory([...history, response, prompt + "*".repeat(val.length)])
        setInputHistory([...inputHistory, "pw"])
        e.target.value = ''      
        setPassword(val)
        setPasswordInput("text")
        setResponse(`Your password is set, type [s] to send your dead-drop mesage`)    
      } 
      
      // ## NEW ## After typing their msg and pw, the user is prompted to confirm submission of dead-drop
      else if (val === "s" && inputHistory.includes("pw") && !inputHistory.includes("sent")) {
        postMessage()
        historyUpdater(e, "sent")
        setResponse("Encrypting...")
      }

      // ## VIEW ## After selecting messages, user selects v to view a message
      else if (val === "v" && inputHistory.includes("m")) {
        historyUpdater(e, "v")
        setResponse("Please input the message ID of the message you would like to view")
      }

      // ## VIEW ## After typing their message ID, the user is prompted to input the password
      else if (inputHistory.includes('m') && inputHistory.includes('v') && !inputHistory.includes('reqMsg')) {
        historyUpdater(e, "reqMsg")
        setReqMessage(val)
        setPasswordInput("password")
        setResponse("Your message has been staged, please input the correct password")
      }

      // ## VIEW ## After typing the password, the user is prompted to submit the command
      else if (inputHistory.includes('v') && inputHistory.includes('reqMsg') && !inputHistory.includes('reqPw')) {
        setHistory([...history, response, prompt + "*".repeat(val.length)])
        setInputHistory([...inputHistory, "reqPw"])
        e.target.value = ''
        setReqPassword(val)
        setPasswordInput("text")
        setResponse("Your password is set, type [s] to view the dead-drop message")
      }

      // ## VIEW ## After inputing their message password, the user submits the payload to the db
      else if (val === "s" && inputHistory.includes("v") && inputHistory.includes('reqPw') && !inputHistory.includes('reqSent')) {
        getMessage()
        historyUpdater(e, "reqSent")
        setResponse("Decrypting...")
      }

      // ## DELETE ## After selecting m for message, the user chooses d to delete a message
      else if (val === "d" && inputHistory.includes("m")) {
        historyUpdater(e, "d")
        setResponse("Please input the message ID of the message you would like to delete")
      }

      // ## DELETE ## After typing their message ID, the user is prompted to input the password
      else if (inputHistory.includes('m') && inputHistory.includes('d') && !inputHistory.includes('reqMsg')) {
        historyUpdater(e, "reqMsg")
        setReqMessage(val)
        setPasswordInput("password")
        setResponse("Your message has been staged for deletion, please input the correct password")
      }

      // ## DELETE ## After typing the password, the user is prompted to submit the command
      else if (inputHistory.includes('d') && inputHistory.includes('reqMsg') && !inputHistory.includes('reqPw')) {
        setHistory([...history, response, prompt + "*".repeat(val.length)])
        setInputHistory([...inputHistory, "reqPw"])
        e.target.value = ''
        setReqPassword(val)
        setPasswordInput("text")
        setResponse("Your password is set, type [s] to delete the dead-drop message")
      }

      // ## DELETE ## After inputing the message id, the system deletes the message and tells the user
      else if (inputHistory.includes("m") && inputHistory.includes("d")) {
        deleteMessage()
        historyUpdater(e, "reqSent")
        setResponse("Deleting...")
        // setResponse(`Your message with id: ${msgID} has been deleted. Exit the application or press [r] to return to the initial menu.`)
      }

      // ## EDIT MESSAGE ### After selecting m for message, the user chooses e to edit a message
      else if (val === "e" && inputHistory.includes("m")) {
        historyUpdater(e, "e")
        setResponse("Pleases input the message ID of the message you would like to edit")
      }

      // ## EDIT MESSAGE ### After typing their message ID, the user is prompted to input the password
      else if (inputHistory.includes('m') && inputHistory.includes('e') && !inputHistory.includes('reqMsg')) {
        historyUpdater(e, "reqMsg")
        setReqMessage(val)
        setPasswordInput("password")
        setResponse("Your message has been staged, please input the correct password")
      }

      // ## EDIT MESSAGE ### After typing the password, the user is prompted to submit the command
      else if (inputHistory.includes('e') && inputHistory.includes('reqMsg') && !inputHistory.includes('reqPw')) {
        setHistory([...history, response, prompt + "*".repeat(val.length)])
        setInputHistory([...inputHistory, "reqPw"])
        e.target.value = ''
        setReqPassword(val)
        setPasswordInput("text")
        setResponse("Your password is set, type your new message to update the dead-drop")
      }

      // ## EDIT MESSAGE ### After typing their message ID, the user is prompted to input the password
      else if (inputHistory.includes('reqMsg') && inputHistory.includes('reqPw') && !inputHistory.includes('updMsg') && inputHistory.includes("e")) {
        historyUpdater(e, "updMsg")
        setUpdatedMessage(val)
        setResponse("Your updated message has been staged, press [s] to submit.")
      }

      // ## EDIT MESSAGE ### After inputing the message id, the system retrieves the message and returns it
      else if (val === "s" && inputHistory.includes('e') && inputHistory.includes('updMsg') && !inputHistory.includes('reqSent') && !inputHistory.includes('c')) {
        editMessage();
        historyUpdater(e, "reqSent");
        setResponse("Encrypting message update...")
      }
      
      // ## EDIT PASSWORD ### After selecting m for message, the user chooses e to edit a message
      else if (val === "c" && inputHistory.includes("m")) {
        historyUpdater(e, "c")
        setResponse("Pleases input the message ID of the message you would like to edit")
      }

      // ## EDIT PASSWORD ### After typing their message ID, the user is prompted to input the password
      else if (inputHistory.includes('m') && inputHistory.includes('c') && !inputHistory.includes('reqMsg')) {
        historyUpdater(e, "reqMsg")
        setReqMessage(val)
        setPasswordInput("password")
        setResponse("Your message has been staged, please input the correct password")
      }

      // ## EDIT PASSWORD ### After typing the password, the user is prompted to submit the updated password
      else if (inputHistory.includes('c') && inputHistory.includes('reqMsg') && !inputHistory.includes('reqPw')) {
        setHistory([...history, response, prompt + "*".repeat(val.length)])
        setInputHistory([...inputHistory, "reqPw"])
        e.target.value = ''
        setReqPassword(val)
        setResponse("Your password is set, type your new password to update the dead-drop")
      }

      // ## EDIT PASSWORD ### After typing their updated password, the user is prompted to submit the updated dead-drop
      else if (inputHistory.includes('reqMsg') && inputHistory.includes('reqPw') && !inputHistory.includes('updPw') && inputHistory.includes('c')) {
        setHistory([...history, response, prompt + "*".repeat(val.length)])
        setInputHistory([...inputHistory, "updPw"])
        e.target.value = ''
        setUpdatedPassword(val)
        setPasswordInput("text")
        setResponse("Your updated password has been staged, press [s] to submit.")
      }

      // ## EDIT PASSWORD ### After inputing the message id, the system retrieves the message and returns it
      else if (val === "s" && inputHistory.includes('c') && inputHistory.includes('updPw') && !inputHistory.includes('reqSent') && !inputHistory.includes('e')) {
        editPassword();
        historyUpdater(e, "reqSent");
        setResponse("Encrypting password update...")
      }

      // ## RETURN TO MAIN ## All encompassing handling of returning to the initial menu within the application (KEEPS RESPONSE HISTORY)
      else if (val === "r") {
        const newInputHistory = []
        setInputHistory(newInputHistory)
        e.target.value = ''
        console.log("INPUT HISTORY 3: ", inputHistory)
        setResponse("Returning to initial menu...")
        setTimeout(() => {setResponse(`Type [m] for message sharing, [f] for file sharing.`)}, 2000)
      }
      
      // CLEARS RESPONSE AND INPUT HISTORY
      else if (val === "clear") {
        const newInputHistory = []
        setInputHistory(newInputHistory)
        e.target.value = ''
        const newHistory = []
        setHistory(newHistory)
        setResponse(`Type [m] for message sharing, [f] for file sharing.`)
      }

      // EASTER EGGS
      else if (val === "morpheus") {
        setHistory([...history, response, prompt + val])
        e.target.value = ''
        setResponse("Hello, Neo")
      }

      else if (val === "matrix") {
        setHistory([...history, response, prompt + val])
        e.target.value = ''
        setResponse("Follow the white rabbit...")
      }

      else if (val === "42") {
        setHistory([...history, prompt + "42"])
        e.target.value = ''
        setResponse("What is the meaning of life, the universe and everything?")
      }

      // Handles any improper commands throughout the application
      else {
        setHistory([...history, response, prompt + val])
        setResponse(`The command: "${val}" is not supported. Please try again.`)
        e.target.value = ''
      }
    }
  }

  let historyList = history.map((el, index) => {
    return <p data-testid="history-dd" key={index}>{el}</p>
  })
 
  useEffect(() => {
    console.log("INPUT HISTORY: ", inputHistory)

    // ############# MSG HANDLING ###############

    // SIMPLE MESSAGE ERROR HANDLING
    if (messageResult === undefined) {
      setResponse("An error has occurred, please refresh the page and try again.")
    }
    // ## NEW MSG ##
    else if (inputHistory.includes("pw") && !inputHistory.includes('reqMsg')) {
      setResponse(`Your dead-drop is now saved and passworded protected. Your message id is: <${msgId}>. Please keep this message ID in a secure location. Exit the application or press [r] to return to the initial menu.`)
    } 
    // ## VIEW MSG ##
    else if (inputHistory.includes('reqSent') && inputHistory.includes('v')) {
      setResponse(`Your message is: ${messageResult}. Exit the application or press [r] to return to the initial menu.`)
    }
    // ## UPDATE MSG ##
    else if (inputHistory.includes('reqSent') && inputHistory.includes('e')) {
      setResponse(`Your message with id: <${reqMessage}> has been updated. Exit the application or press [r] to return to the initial menu.`)
    }
    // ## UPDATE PW ##
    else if (inputHistory.includes('reqSent') && inputHistory.includes('c')) {
      setResponse(`Your password for message: <${reqMessage}> has been updated. Exit the application or press [r] to return to the initial menu.`)
    }
    // ## DELETE MSG ##
    else if (inputHistory.includes('reqSent') && inputHistory.includes('d')) {
      setResponse(`Your message with id: <${reqMessage}> has been deleted. Exit the application or press [r] to return to the initial menu.`)
    }

    // ############# FILE HANDLING ###############

    //## NEW FILE ##
    //Unlike messages, this if handles after the file has been chosen and uploaded by the user
    else if (inputHistory.includes("fu") && filesArr.length === 1 && fileId.length === 0) {
      //console.log("FILES ARRAY: ", filesArr)
      setResponse(`File is staged. Please enter your desired password`)
    }
    else if (inputHistory.includes("fs")) {
      setResponse(`Your file with id: <${fileId}> has been uploaded. Please keep this file ID in a secure location. Exit the application or press [r] to return to the initial menu.`)
    }

    // ## VIEW FILE ##
    else if (inputHistory.includes('reqFileSent') && inputHistory.includes('fv')) {
      // <a href=${fileURL} download>Here</a>
      const fileDownloadLink = document.createElement(`a`);
      fileDownloadLink.href = fileURL;
      fileDownloadLink.setAttribute('download', '')
      fileDownloadLink.click();
      setResponse(`Your file download has begun. Exit the application or press [r] to return to the initial menu.`)
    }

    // ## DELETE FILE ##
    else if (inputHistory.includes('reqFileSent') && inputHistory.includes('fd')) {
      setResponse(`Your file with id: <${fileId}> has been deleted. Exit the application or press [r] to return to the initial menu.`)
    }
  }, [msgId, messageResult, errorResult, filesArr, fileId, fileURL, rerender])

  return ( 
    <div className="terminal">
      <div className="ascii-logo" type="text/babel">
        {/* <pre> */}
          <code>{`
     __            __       __                
 ___/ /__ ___ ____/ /______/ /______  ___    
/ _  / -_) _  / _  /___/ _  / __/ _ \\/ _ \\   
\\_,_/\\__/\\_,_/\\_,_/    \\_,_/_/  \\___/ .__/   
                                   /_/       
        `}</code>
        {/* </pre> */}
      </div>
      <div>
        Welcome to dead-drop, an anonymous file and message sharing application. 
      <br />
      <br />
      </div>
      {/* <br /> */}
      <div className="terminalPrompt">
        {historyList}
        {response}
      </div>
      <br />
      {/* <div> "Type [M] for message sharing or [F] for file sharing." </div> */}
      <div style={{float: "left"}}> user@dead-drop ~ % &nbsp; </div>
      <input autoFocus data-testid="input-dd" type={passwordInput} onBlur={(e)=> e.currentTarget.focus()} className="terminalInput" style={{float: "left"}} onKeyPress={(e) => handleCommands(e)}></input>
    </div>
  );
}
