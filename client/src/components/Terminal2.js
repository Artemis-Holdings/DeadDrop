import AppContext from "../context/AppContext";
import { useContext, useEffect } from "react";
import dialogue from "../dialogue.json"
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
        setMsgId,
        reqMsgId,
        setReqMsgId,
        setReqPassword,
        passwordInput,
        setPasswordInput,
        getMessage,
        messageResult,
        setMessageResult,
        editMessage,
        setUpdatedMessage,
        setUpdatedPassword,
        editPassword,
        deleteMessage,
        errorResult,
        setErrorResult,
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

    const user = "user@dead-drop ~ % "

    function handleCommands(e) {
        if (e.key === "Enter") {
            let val = e.target.value
            let validResponse = history[history.length - 1].validResponse

            if (validResponse.includes("r")) {
                msgId&& setMsgId('');
                messageResult&& setMessageResult('');
                setInputHistory([]);
                setHistory((prevState) => [...prevState, user + ' ' + val]);
            } else if (validResponse.includes(val)) {
                if (validResponse.includes("sendNewMessage")) {
                    postMessage();
                } else if (validResponse.includes("sendViewMessage")) {
                    getMessage();
                }
                setInputHistory((prevState) => [...prevState, val])
                setHistory((prevState) => [...prevState, user + ' ' + val])
            } else if (validResponse.includes("psw")) {
                setPassword(val)
                setInputHistory((prevState) => [...prevState, "psw"])
                setHistory((prevState) => [...prevState, user + ' ' + val])
            } else if (validResponse.includes("msg")) {
                setMessage(val)
                setInputHistory((prevState) => [...prevState, "msg"])
                setHistory((prevState) => [...prevState, user + ' ' + val])
            } else if (validResponse.includes("msgId")) {
                setReqMsgId(val)
                setInputHistory((prevState) => [...prevState, "msgId"])
                setHistory((prevState) => [...prevState, user + ' ' + val])
            } else if (validResponse.includes("none")) {
                return;
            } else {
                setHistory((prevState) => [...prevState, { prompt: "Command not found." }, prevState[prevState.length - 1]])
                document.getElementById("input-dd").value = "";
            }
        }
    }

    let historyList = history.map((el, index) => {
        return <p data-testid="history-dd" key={index}>{el.prompt}</p>
    })

    useEffect(() => {
        console.log('errorResult: ', errorResult)
        
        if (inputHistory.length === 0) {
            setHistory((prevState) => [...prevState, dialogue.init])
            document.getElementById("input-dd").value = "";
        } else if (inputHistory.length > 0 && !msgId && !messageResult) {
            let newPrompt = dialogue.message.find(el => JSON.stringify(el.inputHistory) === JSON.stringify(inputHistory))
            setHistory((prevState) => [...prevState, newPrompt])
            document.getElementById("input-dd").value = "";
        } else if (msgId) {
            setHistory((prevState) => [...prevState, { prompt: `Your dead-drop is now saved and passworded protected. Your message id is: <${msgId}>. Please keep this message ID in a secure location. Exit the application or press [r] to return to the initial menu.`, inputHistory: ["postMsgComplete"], validResponse: ["r"] }])
        } else if (messageResult) {
            setHistory((prevState) => [...prevState, { prompt: `Your message is: ${messageResult}. Exit the application or press [r] to return to the initial menu.`, inputHistory: ["viewMsgComplete"], validResponse: ["r"] }]);
        } 
        // else if (errorResult) {
        //     setHistory((prevState) => [...prevState, { prompt: errorResult }]);
        //     setInputHistory(["m", "v"])
        //     setErrorResult('');
        // }
    }, [inputHistory, msgId, messageResult, errorResult, setHistory])

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

            </div>
            <br />
            {/* <div> "Type [M] for message sharing or [F] for file sharing." </div> */}
            <div style={{ float: "left" }}> user@dead-drop ~ % &nbsp; </div>
            <input autoFocus id="input-dd" type={passwordInput} onBlur={(e) => e.currentTarget.focus()} className="terminalInput" style={{ float: "left" }} onKeyPress={(e) => handleCommands(e)}></input>
        </div>
    );
}
