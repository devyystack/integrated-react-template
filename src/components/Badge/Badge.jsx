import React from "react";
import BadgeSatellite from "./BadgeSatellite";
import { useSelector } from "react-redux";
// import './index.scss'

export default function Badge() {
  const selectedMap = useSelector((state) => state.game.selectedMap);

  const usingBadges = useSelector((state) => state.badge.usingBadges);
  return (
    selectedMap === 0 && (
      <div className="badge-container">
        <div className="badge-section">
          {usingBadges?.map((badge, index) => (
            // <div key={index} className="badge">
            //     <img src={SERVERURL + badge.badge_img} alt={badge.name} className="badge-img" />
            // </div>

            <BadgeSatellite key={index} {...badge} />
          ))}
        </div>
      </div>
    )
  );
}
