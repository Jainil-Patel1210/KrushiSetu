import React from 'react';
import './Guidlines.css';

function Guidlines() {
    return (
       <>
        <div>
           <div className='Guidlines-bg flex justify-center items-center'>
                <div className='bg-[#dee4e15e]  w-150 h-40 flex flex-col rounded-sm'>
                    <p className='text-3xl font-bold text-center mt-10'>A Guide to Subsidies</p>
                    <button className='bg-green-600 text-white font-semibold text-xl mt-5 w-40 ml-55 rounded-sm p-1'>See Guidlines</button>
                </div>
           </div>
        </div>
       </>
    );
}

export default Guidlines;
