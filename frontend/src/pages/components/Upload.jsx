import React from 'react'
import form from "../styles/Upload.module.css"

export default function Upload() {

    return (
        <div>
            <form action={"http://localhost:8000/"}
                  method={"post"}
                  encType={"multipart/form-data"}
                  target={"_blank"}
            >
                <input type={"file"} name={"data"} accept={"application/json"} required={true}/>
                <button type={"submit"}>Загрузить</button>
            </form>
        </div>
    )
}