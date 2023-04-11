import React from "react";
import { useSelector } from "react-redux";
import FlashMessage from "./FlashMessage";
// import './index.scss'
export default function Flash() {
  const flashes = useSelector((state) => state.flash.flashes);
  return (
    flashes.length !== 0 && (
      <div className="flash-container">
        {flashes.map((flash, index) => (
          <FlashMessage key={index} {...flash} />
        ))}
      </div>
    )
  );
}
