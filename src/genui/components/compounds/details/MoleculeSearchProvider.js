import {useState} from "react"
import { Spinner } from "reactstrap"

function MoleculeSearchProvider(props) {
    const mode = props.mode

    return (
    <>
        {mode === "searching" ? (<Spinner/>) : (<>Results</>)}
    </>
    )
}

export default MoleculeSearchProvider