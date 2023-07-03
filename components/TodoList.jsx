import Todo from "./Todo"

export default function TodoList(todos, user, signOut) {
    return (
        <div className=" w-3/4 lg:w-1/2 mx-auto my-10">
            <div className="h-10">
                <h1 className="font-bold text-4xl inline-block h-10 float-left">Hello, {user.username}</h1>
                <button className="border-2 border-red-400 inline-block float-right h-10 px-3 text-md font-semibold rounded-lg text-red-400" onClick={signOut}>Sign out</button>
            </div>
            <hr class="h-0.5 my-5 bg-gray-100 border-0 dark:bg-gray-300"/>
            <div className="h-12">
                <input placeholder="Enter a todo" className=" rounded-lg w-3/4 float-left h-full border px-3 my-0 inline-block" />
                <button className="bg-green-400 float-right text-white h-full px-8 text-2xl rounded-lg font-bold m-auto inline-block mx-auto">+</button>
            </div>
            {todos ? 
                <i className="my-5 block text-center text-gray-400">No todos</i>
            :
                <Todo />
            }
        </div>
    )
}