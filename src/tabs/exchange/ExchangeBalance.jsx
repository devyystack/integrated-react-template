import React from 'react'

export default function ExchangeBalance(props) {
    return (
        <div className="resource-balance-wrapper">
            <div className="resource-balance-amount">
                {parseFloat(props?.resource || 0).toFixed(2)}

            </div>
            <img src={props?.image} alt="Resource Balance Icon" className={props?.type && "resource-balance-icon"} />
            {props?.type && <div className="resource-balance-metrics">
                {props.type}
            </div>}
        </div>
    )
}
