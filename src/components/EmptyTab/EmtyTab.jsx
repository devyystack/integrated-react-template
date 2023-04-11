import React from "react";
import { ChooseTab } from "../../redux/slice/navBarSlice";

import Button from "../Button/Button";
import { useDispatch } from "react-redux";
export default function EmtyTab() {
  const dispatch = useDispatch();
  return (
    <section className="empty-container">
      <div className="empty-content">
        <div className="empty-content-wrapper">
          {/* <img src="../../static/media/noitems.png" alt="Go For New Cards" />  //  updated by */}
          <div className="empty-text">
          Purchase tools to start mining!
          </div>
          <div className="empty-group__button">
            <a
              className="link"
              target="_blank"
              rel="noopener noreferrer"
              href="https://wax.atomichub.io/market?collection_name=galaxyminerx&order=desc&sort=created&symbol=WAX"           // mainnet
              // href="https://wax-test.atomichub.io/market?collection_name=galaxyminerx&order=desc&sort=created&symbol=WAX"    // testnet
            >
              <Button
                text="SHOP"
                atr="semi-long "
                wrapperClassname="full-width"
                handleClick={() => dispatch(ChooseTab(1))}
              />
            </a>
            {/* <Button
              text="Go to Smithy"
              atr="semi-long "
              wrapperClassname="full-width"
              handleClick={() => dispatch(ChooseTab(2))}
            /> */}
          </div>
        </div>
      </div>
    </section>
  );
}
