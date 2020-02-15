import { model, Model, modelAction, tProp, types, fromSnapshot, modelSnapshotInWithMetadataDeep} from '../../src'

let maxId = 0

@model("apptest/Todo")
export class Todo extends Model({
    text: tProp(types.string),
    done: tProp(false),
    id: tProp(types.string, () => `${maxId++}`),
}) {
    getRefId() {
        return this.id
    }
    @modelAction
    setDone(done: boolean) {
        this.done = done
    }
    @modelAction
    setText(text: string) {
        this.text = text
    }
}

enum Enum {
    e0,
    e1,
}

@model("apptest/TodoStore")
export class TodoStore extends Model({
    todo: tProp(types.model<Todo>(Todo)),
    todos: tProp(types.array(types.model<Todo>(Todo)), () => []),
    enum: tProp(types.enum<Enum>(Enum), Enum.e0),
}) {
    @modelAction
    addTodo(todo: Todo) {
        this.todos.push(todo)
    }
    @modelAction
    clear() {
        this.todos = []
    }
}

test("load from snapshot without meta", () => {
    const sn = modelSnapshotInWithMetadataDeep(TodoStore, {
        "todo": { "text": "rootTodo", "done": false, "id": "0" },
        "todos": [
            { "text": "todo1", "done": true, "id": "1" },
            { "text": "todo2", "done": false, "id": "2" },
        ],
        "enum": Enum.e1,
    } as any)
    expect(sn.enum).toBe(Enum.e1)
    expect(sn.todo.text).toBe("rootTodo")
    expect(sn.todo.done).toBe(false)
    expect(sn.todo.id).toBe('0')
    expect(sn.todos).toBeTruthy()
    if (!sn.todos) throw Error('for ts')
    expect(sn.todos.length).toBe(2)
    expect(sn.todos[0].text).toBe('todo1')
    expect(sn.todos[0].id).toBe('1')
    expect(sn.todos[0].done).toBe(true)
    expect(sn.todos[1].text).toBe('todo2')
    expect(sn.todos[1].id).toBe('2')
    expect(sn.todos[1].done).toBe(false)

    const store = fromSnapshot<TodoStore>(sn)
    expect(store.enum).toBe(Enum.e1)
    expect(store.todo.text).toBe("rootTodo")
    expect(store.todo.done).toBe(false)
    expect(store.todo.id).toBe('0')
    expect(store.todos.length).toBe(2)
    expect(store.todos[0].text).toBe('todo1')
    expect(store.todos[0].id).toBe('1')
    expect(store.todos[0].done).toBe(true)
    expect(store.todos[1].text).toBe('todo2')
    expect(store.todos[1].id).toBe('2')
    expect(store.todos[1].done).toBe(false)
})
