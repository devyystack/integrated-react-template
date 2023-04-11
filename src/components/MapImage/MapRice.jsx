/** @format */

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { chooseUsingCard } from "../../redux/slice/ToolsSlicer";
import { ChooseTab } from "../../redux/slice/navBarSlice";

const cropsImg = ["./img/corn.png", "./img/barley.png"];

export default function MapRice() {
  const plantsUsing = useSelector((state) => state.plants.plantsUsing);
  const dispatch = useDispatch();

  const handleChoose = (index) => {
    dispatch(ChooseTab(0));
    dispatch(chooseUsingCard(index));
  };

  return (
    <>
      <div className="game-container__image--rice">
        {plantsUsing?.map((item, index) => (
          <div key={index} >
            {item.name.includes("Corn") && (
              <img
                className="rice"
                src={cropsImg[0]}
                alt={index}
                key={index}
                onClick={() => handleChoose(index)}
              />
            )}
            {item.name.includes("Barley") && (
              <img
                className="rice"
                src={cropsImg[1]}
                alt={index}
                key={index}
                onClick={() => handleChoose(index)}
              />
            )}
          </div >
        ))}
      </div>
    </>
  );
}
