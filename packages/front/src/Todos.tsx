
export function Todos (props: { todos: string[]}) {

    return <ul>
        { props.todos.map(todo => <li>{ todo }</li>) }
    </ul>
}