import React from "react";
import { useState, useEffect, useRef } from "react";
import dialogue from "../dialogue.json"
import "./Terminal.css";

let spinnerCount = 0; //for cli-spiner

export default function TerminalRender() {
    const [message, setMessage] = useState("");
    const [password, setPassword] = useState("");
    const [history, setHistory] = useState([]);
    const [inputHistory, setInputHistory] = useState([]);
    const [inputType, setInputType] = useState("text")
    const [spinner, setSpinner] = useState("/");
    const [msgId, setMsgId] = useState("");
    const [reqMsgId, setReqMsgId] = useState("");
    const [title, setTitle] = useState("");
    const [file, setFile] = useState();
    const [messageResult, setMessageResult] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [processCompleteMsg, setProcessCompleteMsg] = useState("");
    const [errorResult, setErrorResult] = useState("");
    const [fileDialogueIsOpen, setFileDialogueIsOpen] = useState(false)

    const fileInputRef = useRef(null);

    function superFetch(action) {
        setIsLoading(true);

        let headers = {
            din: reqMsgId,
            title: title,
            message: message,
            password: password,
            action: action,
        }
        
        var requestOptions = {
            method: 'POST',
            headers: headers,
            body: file ? file: undefined
        }

        let deaddropObj = {
            din: "",
            title: "",
            message: "",
            notice: ""
        }

        fetch("/api/deaddrop", requestOptions)
            .then(res => {
                for (const pair of res.headers.entries()) {
                    if (deaddropObj.hasOwnProperty(pair[0])) {
                        deaddropObj[`${pair[0]}`] = pair[1];
                    }
                }
                if (res.ok) {
                    return res.blob();
                }
                throw new Error(deaddropObj.notice);
            })
            .then((data) => {
                if (data.size > 0) {
                    const aElement = document.createElement('a');
                    aElement.setAttribute('download', deaddropObj.title);
                    const href = URL.createObjectURL(data);
                    aElement.href = href;
                    aElement.setAttribute('target', '_blank');
                    aElement.click();
                    URL.revokeObjectURL(href);
                    aElement.remove();
                }

                switch (action) {
                    case 'CREATE':
                        setHistory((prevState) => [...prevState, { prompt: `Your dead-drop is now saved and passworded protected. Your message id is: <${deaddropObj.din}>. Please keep this message ID in a secure location. Exit the application or press [enter] to return to the initial menu.`, validResponse: ["r"] }])
                        setProcessCompleteMsg('Encrypted!');
                        break;
                    case 'READ':
                        setHistory((prevState) => [...prevState, { prompt: `Title: ${deaddropObj.title}. \nMessage: ${deaddropObj.message}. Exit the application or press [enter] to return to the initial menu.`, validResponse: ["r"] }]);
                        setProcessCompleteMsg('Decrypted!');
                        break;
                    case 'DELETE':
                        setHistory((prevState) => [...prevState, { prompt: 'Your dead drop has been destroyed. Exit the application or press [enter] to return to the initial menu.', validResponse: ["r"] }]);
                        setProcessCompleteMsg('Deleted!');
                    case 'UPDATE':
                        setHistory((prevState) => [...prevState, { prompt: 'Your dead drop has been updated. Exit the application or press [enter] to return to the initial menu.', validResponse: ["r"] }]);
                        setProcessCompleteMsg('Updated!');
                }

                setIsLoading(false);
            })
            .catch(error => {
                setHistory((prevState) => [...prevState, { prompt: `${error}` }]);
                setInputHistory([])
                setIsLoading(false)
            });
    }

    const user = "user@dead-drop ~ % "

    function handleCommands(e) {
        if (e.key === "Enter") {
            let val = e.target.value
            let validResponse = history[history.length - 1].validResponse

            if (validResponse.includes("r")) {
                msgId && setMsgId('');
                messageResult && setMessageResult('');
                setInputHistory([]);
                setHistory((prevState) => [...prevState, { prompt: user + ' ' + val }])
            } else if (validResponse.includes(val)) {
                if (validResponse.includes("sendNewDeaddrop")) {
                    superFetch("CREATE");
                } else if (validResponse.includes("sendViewMessage")) {
                    superFetch("READ");
                } else if (validResponse.includes("sendDeleteMessage")) {
                    superFetch("DELETE");
                } else if (validResponse.includes("sendEditMessage")) {
                    superFetch("UPDATE");
                }
                setInputHistory((prevState) => [...prevState, val])
                setHistory((prevState) => [...prevState, { prompt: user + ' ' + val }])
            } else if (validResponse.includes("psw")) {
                if (!password) {
                setPassword(val)
                setHistory((prevState) => [...prevState, { prompt: user + ' ' + val.replaceAll(/./g, '•') }, {prompt: 'Enter password again', validResponse: ["psw"]}])
                } else if (password === val) {
                    setInputHistory((prevState) => [...prevState, "psw"])
                    setHistory((prevState) => [...prevState, { prompt: user + ' ' + val.replaceAll(/./g, '•') }])
                } else {
                    setHistory((prevState) => [...prevState, { prompt: user + ' ' + val.replaceAll(/./g, '•') }, { prompt: "Passwords do not match. Try again.", validResponse: ["psw"] }])
                    setPassword("")
                }
            } else if (validResponse.includes("msg")) {
                setMessage(val)
                setInputHistory((prevState) => [...prevState, "msg"])
                setHistory((prevState) => [...prevState, { prompt: user + ' ' + val }])
            } else if (validResponse.includes("title")) {
                setTitle(val)
                setInputHistory((prevState) => [...prevState, "title"])
                setHistory((prevState) => [...prevState, { prompt: user + ' ' + val }])
            } else if (validResponse.includes("attachment")) {
                if (val === "y") {
                    fileInputRef.current.click()
                    setInputHistory((prevState) => [...prevState, "attachment"])
                } else if (val === "n") {
                    setInputHistory((prevState) => [...prevState, "attachment"])
                    setHistory((prevState) => [...prevState, { prompt: "No file added." }])
                } else {
                    setHistory((prevState) => [...prevState, { prompt: "Command not found." }, prevState[prevState.length - 1]])
                }
            } else if (validResponse.includes("msgId")) {
                setReqMsgId(val)
                setInputHistory((prevState) => [...prevState, "msgId"])
                setHistory((prevState) => [...prevState, { prompt: user + ' ' + val }])
            } else if (validResponse.includes("none")) {
                return;
            } else {
                setHistory((prevState) => [...prevState, { prompt: "Command not found." }, prevState[prevState.length - 1]])
            }
            document.getElementById("input-dd").value = "";
        }
    }

    //Handles terminal updates
    useEffect(() => {
        if (!fileDialogueIsOpen) {
            if (inputHistory.length === 0) {
                setHistory((prevState) => [...prevState, dialogue.init])
                document.getElementById("input-dd").value = "";
            } else if (inputHistory.length > 0 && !msgId && !messageResult) {
                let newPrompt = dialogue.message.find(el => JSON.stringify(el.inputHistory) === JSON.stringify(inputHistory))
                setHistory((prevState) => [...prevState, newPrompt])
                document.getElementById("input-dd").value = "";
            }
        }
    }, [inputHistory, msgId, messageResult, errorResult, fileDialogueIsOpen])

    //Handles cli-spinner
    const frames = ["", ".", "..", "...", "...-", "...\\", "...|", ".../", "...-", "...\\", "...|", ".../"];
    useEffect(() => {
        if (isLoading) {
            if (spinnerCount === frames.length) {
                spinnerCount = 0;
            }
            setTimeout(() => {
                setSpinner(frames[spinnerCount])
                spinnerCount++;
            }, 125)
        }
        if (processCompleteMsg) {
            setHistory((prevState) => {
                prevState[prevState.length - 2] = { prompt: processCompleteMsg };
                return prevState;
            })
            setProcessCompleteMsg("")
        }
    }, [spinner, isLoading, processCompleteMsg])

    //Handles hidding password
    useEffect(() => {
        if (history[history.length - 1]?.validResponse?.includes('psw')) {
            setInputType('password')
        } else {
            setInputType('text')
        }
    }, [history])

    //Handless file dialogue cancel
    useEffect(() => {
        document.getElementById("file-input").addEventListener("cancel", (event) => {
            setHistory((prevState) => [...prevState, { prompt: "No file added." }])
            setFileDialogueIsOpen(false)
        })
    }, [])

    let historyList = history.map((el, i) => {
        return <p key={i}>{el.prompt}{isLoading && i === history.length - 1 && spinner}</p>
    })

    return (
        <div id="terminal">
            <div className="ascii-logo" type="text/babel">
                {/* <pre> */}
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
            {!isLoading && <div style={{ float: "left" }}> user@dead-drop ~ % &nbsp; </div>}
            <input autoFocus id="input-dd" type={inputType} className="terminalInput" onBlur={(e) => e.currentTarget.focus()} style={{ visibility: isLoading ? 'hidden' : 'visible' }} onKeyDown={(e) => handleCommands(e)} />
            <input id="file-input" type="file" ref={fileInputRef} onClick={e => setFileDialogueIsOpen(true)} onChange={e => { setFileDialogueIsOpen(false); setFile(new Blob([e.target.files[0]], {type: e.target.files[0].type}));}} style={{ display: 'block', visibility: 'hidden', width: 0, height: 0 }} />
        </div>
    );

}
