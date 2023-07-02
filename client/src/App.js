import React from "react";
import TerminalRender from "./components/Terminal";

export default function App() {

  return (
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
  );
}
