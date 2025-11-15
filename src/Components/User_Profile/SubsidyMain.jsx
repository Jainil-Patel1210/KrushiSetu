import React from 'react'
import Header from './Header'
import Settings from '../HomePage/Settings'
import Subsidy_List from './Subsidy_List'
import Sidebar from './Sidebar'

function SubsidyMain() {
    return (
        <>
            <Header />
            <Subsidy_List />
            <Settings />
        </>
    )
}

export default SubsidyMain
