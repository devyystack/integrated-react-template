import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import lottie from "lottie-web";
import { useSelector } from "react-redux";
// import * as animationData from "../../pages/game/Splash.json";

export default function Splash() {
  const isShowing = useSelector((state) => state.auth.splash);
  useEffect(() => {
    lottie.loadAnimation({
      container: document.querySelector("#splash-container"),
      // animationData: animationData.default,
      renderer: "svg", // "canvas", "html"
      loop: true, // boolean
      autoplay: true, // boolean
    });
  });

  return isShowing
    ? ReactDOM.createPortal(
        <React.Fragment>
          <div
            style={{ backgroundImage: "url(./img/login-background.jpg)" }}
            className="login-container"
          >
            <div
              className="splash-content"
              id="splash-container"
              style={{ width: "20%", height: "100%" }}
            ></div>
          </div>
        </React.Fragment>,
        document.body
      )
    : null;
}
