import {FaTrashAlt} from "react-icons/fa"
import { updateTodo } from "@/src/graphql/mutations"
import { Amplify, API } from "aws-amplify"
import awsmobile from "@/src/aws-exports"
import { useState } from "react"
import styles from '../styles.module.css'



Amplify.configure({...awsmobile, ssr: true})

export default function Todo({handleDelete, handleDone, title, done, id}) {

    const [checked, setChecked] = useState(done)

    const updateDone = async (id) => {
        () => handleDone
        setChecked(!checked)
        const {data} = await API.graphql({
            query: updateTodo,
            variables: {
                input: {
                    id: id,
                    done: !checked
                }
            },
            authMode: "AMAZON_COGNITO_USER_POOLS"
        })
    }

    return (
        <div className={`h-14 flex px-5 rounded-lg my-2`}>
            <input onChange={() => updateDone(id)} checked={checked} type="checkbox" className="my-auto" />
            <p style={checked ? {textDecoration: 'line-through'} : null} className={`my-auto mx-auto ml-5 w-3/4 text-md ${checked ? `opacity-50` : `opacity-100`}`}>{title}</p>
            <FaTrashAlt onClick={handleDelete} className={`my-auto text-red-400 ${styles.FaTrashAlt}`} />
        </div>
    )
}