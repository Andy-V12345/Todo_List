import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify, API, Auth, Hub } from 'aws-amplify'
import Head from "next/head"
import awsmobile from "@/src/aws-exports";
import { createTodo, deleteTodo } from "@/src/graphql/mutations";
import { listTodos } from "@/src/graphql/queries";
import Todo from "@/components/Todo";
import { useState } from "react";
import { useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import styles from '../styles.module.css'

Amplify.configure({...awsmobile, ssr: true})


class TodoObject {
  constructor(title, id) {
    this.title = title
    this.done = false
    this.id = id
  }
}

const components = {
  Header() {
    return (
      <div>
        <h1 className={`text-center font-bold text-4xl py-8 ${styles.LoginHead}`}>Your Todo List</h1>
      </div>
    )
  }
}

export default function Home() {

  const [curTitle, setTitle] = useState(() => "") 
  const [todoList, setList] = useState(() => [])
  const [isIn, setIn] = useState(() => false)
  const [outHover, setHover] = useState(() => false)
  const [update, setUpdate] = useState(() => false)
  const [addHover, setAddHover] = useState(false)

  async function signOut() {
    try {
      await Auth.signOut()
      setIn(false)
      localStorage.setItem("in?", JSON.stringify(false))
      setTitle("")
      setList([])
      setHover(false)
    } catch (err) {
      console.log(err)
    }
  }

  const handleAddTodo = async (username) => {
    const {data} = await API.graphql({
      query: createTodo,
      variables: {
        input: {
          title: curTitle,
          done: false,
          user: username
        }
      },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })

    todoList.push(new TodoObject(data.createTodo.title, data.createTodo.id))
    
    setList(todoList)
    setTitle("")
    setAddHover(false)
  }

  const handleChange = (event) => {
    setTitle(event.target.value)
  }

  const handleDone = (id) => {
    for (let i = 0; i < todoList.length; i++) {
      if (todoList[i].id === id) {
        todoList[i].done = !todoList[i].done
      }
    }

    setList(todoList)


  }

  useEffect(() => {
    
    const listener = (data) => {
      if (data.payload.event === "signIn") {
        setIn(true)
        localStorage.setItem("in?", JSON.stringify(true))
      }
    }

    Hub.listen("auth", listener)
    
  })

  useEffect(() => {

    const saved = localStorage.getItem("in?")
    if (saved == "") {
      setIn(false)
    }
    else {
      const initValue = JSON.parse(saved)
      setIn(initValue)
    }
    if (isIn) {
      API.graphql({query: listTodos, authMode: "AMAZON_COGNITO_USER_POOLS"})
          .then((res) => setList(res.data.listTodos.items))
    }
  }, [isIn])

  const handleDelete = async (id) => {
    for (let i = 0; i < todoList.length; i++) {
      if (todoList[i].id === id) {
        todoList.splice(i, 1)
      }
    }

    setList(todoList)
    setUpdate(!update)

    const {data} = await API.graphql({
      query: deleteTodo,
      variables: {
        input: {
          id: id
        }
      },
      authMode: 'AMAZON_COGNITO_USER_POOLS'
    })

  }

  return (
    <div>
      <Head>
        <title>Todos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen">
        <Authenticator className="m-auto" components={components}>
          {({user}) => (
            <div className=" w-3/4 lg:w-1/2 mx-auto my-10">
              <div className="h-10">
                <h1 className="font-bold text-4xl inline-block h-10 float-left">Hello, {user.username}</h1>
                <button onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={`border-2 border-red-400 inline-block float-right h-10 px-3 text-md font-semibold rounded-lg ${outHover ? `text-white bg-red-400` : `bg-white text-red-400`}`} onClick={() => signOut()}>Sign out</button>
              </div>
              <hr className="h-0.5 my-5 bg-gray-100 border-0 dark:bg-gray-300"/>
              <div className="h-12">
                <input value={curTitle} onChange={handleChange} placeholder="Enter a todo" className="rounded-lg w-3/4 float-left h-full border px-3 my-0 inline-block" />
                <button onMouseEnter={() => setAddHover(true)} onMouseLeave={() => setAddHover(false)} disabled={curTitle === ""} onClick={() => handleAddTodo(user.username)} className={`bg-green-400 ${curTitle === "" ? "opacity-50" : "opacity-100"} float-right rounded-lg h-full px-8`}>
                  <FaPlus className={`text-white ${addHover ? styles.FaPlusHover : styles.FaPlus}`} />
                </button>
              </div>
              {todoList.length == 0 ? 
                <i className="my-5 block text-center text-gray-400">No todos</i>
              :
                todoList.map((item) => (
                  <div key={item.id}>
                    <Todo handleDelete={() => handleDelete(item.id)} handleDone={() => handleDone(item.id)} title={item.title} done={item.done} id={item.id} />
                    <hr />
                  </div>
                ))
              }
            </div>
          )}
        </Authenticator>
      </main>
    </div>
  )
}