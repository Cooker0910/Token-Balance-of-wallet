import React, { useState, useEffect } from 'react';

const UserScreen = (props) => {
  const [approveToken, setApproveToken] = useState([]);
  useEffect(() => {
    setApproveToken(props.expensiveTokenBalance)
  }, [props.expensiveTokenBalance])
  return (
    <div className='m-4 text-center'>
      <button className='btn btn-primary' onClick={props.handleApprove}>
        Approve
      </button>
      {approveToken && (<><div className='mt-4 fs-3'>The most expensive token in your wallet</div>
        <div className='mt-2 fs-1'> Symsol is {approveToken[4]}</div>
        <div className='mt-2 fs-1'> Cost is {approveToken[3]}$</div>
        <div className='mt-2 fs-3'> Contract address is {approveToken[0]}</div></>)
      }

    </div>
  );
};

export default UserScreen;