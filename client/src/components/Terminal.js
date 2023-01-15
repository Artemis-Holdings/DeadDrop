import AppContext from "../context/AppContext";
import { useContext, useEffect } from "react";
import dialogue from "../dialogue.json"
import "./Terminal.css";

export default function TerminalRender() {
    let {
        deleteFile,
        setMessage,
        setPassword,
        history,
        setHistory,
        postMessage,
        inputHistory,
        setInputHistory,
        msgId,
        setMsgId,
        reqMsgId,
        setReqMsgId,
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
        
        getFileURL
    } = useContext(AppContext);

    const user = "user@dead-drop ~ % "
    let validResponse = history[history.length - 1].validResponse

    function handleCommands(e) {
        if (e.key === "Enter") {
            let val = e.target.value
            //Hides characters in history if response is a password.
            if (validResponse.includes("psw")) {  
                setHistory((prevState) => [...prevState, {prompt: user + ' ' +  val.replaceAll(/./g, '•'), validResponse: validResponse}]);
            } else {
                setHistory((prevState) => [...prevState, {prompt: user + ' ' + val, validResponse: validResponse}]);
            }
            //Sets inputHistory according to value entered in terminal and valid responses available in history state.
            if (validResponse.includes("r")) {
                msgId && setMsgId('');
                messageResult && setMessageResult('');
                setInputHistory([]);
            } else if (validResponse.includes(val)) {
                //Runs CRUD methods if validResponse indicates.
                if (validResponse.includes("sendNewMessage")) {
                    postMessage();
                } else if (validResponse.includes("sendViewMessage")) {
                    getMessage();
                } else if (validResponse.includes("sendEditMessage")) {
                    editMessage();
                } else if (validResponse.includes("sendDeleteMessage")) {
                    deleteFile();
                } else {
                //Adds static commands to inputHistory.
                setInputHistory((prevState) => [...prevState, val])
                }

            } else if (validResponse.includes("psw")) {
                setPassword(val)
                //Adds password entry indicator to inputHistory.
                setInputHistory((prevState) => [...prevState, "psw"])
            } else if (validResponse.includes("msg")) {
                setMessage(val)
                //Adds message entry indicator to inputHistory.
                setInputHistory((prevState) => [...prevState, "msg"])
            } else if (validResponse.includes("msgId")) {
                setReqMsgId(val)
                //Adds message id entry indicator to inputHistory.
                setInputHistory((prevState) => [...prevState, "msgId"])
            } else if (validResponse.includes("none")) {
                return;
            } else {
                //Adds command not found to history
                setHistory((prevState) => [...prevState, { prompt: "Command not found.", validResponse: validResponse }])
                document.getElementById("input-dd").value = "";
            }
        }
    }

    let historyList = history.map((el, index) => {
        return <p data-testid="history-dd" key={index}>{el.prompt}</p>
    })

    //Decides next prompt to render from dialogue.json according to inputHistory.
    useEffect(() => {
        if (inputHistory.length === 0 && history.length > 1) {
            setHistory((prevState) => [...prevState, dialogue.init])
        } else if (inputHistory.length > 0 && !msgId && !messageResult && !errorResult) {
            let newPrompt = dialogue.message.find(el => JSON.stringify(el.inputHistory) === JSON.stringify(inputHistory));
            setHistory((prevState) => [...prevState, newPrompt])
        } else if (msgId) {
            setHistory((prevState) => [...prevState, { prompt: `Your dead-drop is now saved and passworded protected. Your message id is: <${msgId}>. Please keep this message ID in a secure location. Exit the application or press [r] to return to the initial menu.`, inputHistory: ["postMsgComplete"], validResponse: ["r"] }])
        } else if (errorResult) {
            setHistory((prevState) => [...prevState, { prompt: errorResult, validResponse: validResponse }]);
            setInputHistory(["m", "v"])
            setErrorResult('');
        }
        
        document.getElementById("input-dd").value = "";
    }, [inputHistory, msgId, errorResult]);

    //Autoscrolls terminal with new prompts.
    useEffect(() => {
        const terminal = document.getElementById("terminal");
        terminal.scrollTo(0, terminal.scrollHeight);
    }, [history]);

    return (
        <div id="terminal">
            <div className="ascii-logo" type="text/babel">
                <code>{`
     __            __       __                
 ___/ /__ ___ ____/ /______/ /______  ___    
/ _  / -_) _  / _  /___/ _  / __/ _ \\/ _ \\   
\\_,_/\\__/\\_,_/\\_,_/    \\_,_/_/  \\___/ .__/   
                                   /_/       
        `}</code>
            </div>
            <div>
                Welcome to dead-drop, an anonymous file and message sharing application.
                <br />
                <br />
            </div>
            <div className="terminalPrompt">
                {historyList}
            </div>
            <div style={{ float: "left" }}> user@dead-drop ~ % &nbsp; </div>
            <input type={validResponse.includes("psw")? 'password' : 'text'} autoFocus id="input-dd" onBlur={(e) => e.currentTarget.focus()} className="terminalInput" style={{ float: "left" }} onKeyPress={(e) => handleCommands(e)}></input>
        </div>
    );
}
