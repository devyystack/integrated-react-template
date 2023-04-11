import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { deleteFlash } from "../../redux/slice/FlashSlicer";
// import './index.scss'

export default function FlashMessage(props) {
  const dispatch = useDispatch();
  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(deleteFlash(props.id));
    }, props.timeout);
    return () => {
      clearTimeout(timeout);
    };
  }, [props.timeout, dispatch, props.id]);
  return (
    <div className="flash-message-wrapper">
      <div className="flash-message-content">{props.content}</div>
    </div>
  );
}
